import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'


// Baking shadows
// ** **
const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg')

// Simple shadow baking
const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg')

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)


// ** Directional light **
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)


// Assign if a light can cast shadow
directionalLight.castShadow = true

// Optimize shadow resolution, it needs a power of 2 value(bc of mipmapping)
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024

// Change near and far values
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6

// Change size of the field of view of the camera. This is good to have
// a more precise render, it will give better quality overall if its smaller.
// You need to be careful, if you stretch the camera too much, the shadows might get cropped
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = - 2
directionalLight.shadow.camera.left = - 2

// Helper to see the camera from the light's POV. This is an OrtographicCamera.
// Pass in the light.shadow.camera
const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

// Shadow Blur
directionalLight.shadow.radius = 10


// ** SpotLight **
const spotLight = new THREE.SpotLight(0xfffff, 0.4, 10, Math.PI * 0.1)
spotLight.castShadow = true
spotLight.position.set(0, 2, 2)

spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024

spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6

// This is a perspective camera. We can change the FOV
spotLight.shadow.camera.fov = 30

scene.add(spotLight)
scene.add(spotLight.target)

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)


// ** PointLight **
const pointLight = new THREE.PointLight(0xffffff, 0.3)
pointLight.castShadow = true

pointLight.position.set(-1, 1, 0)

pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024

pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 3
scene.add(pointLight)

// This is a PerspectiveCamera that will look on every 6 directions of its cube.
const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)



/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material

    // We include the baked shadow
    // If you move the sphere, the shadow will not move
    //new THREE.MeshBasicMaterial({
    //    map: bakedShadow
    //})
)

plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

// Assign if an object can receive or cast shadow
sphere.castShadow = true
plane.receiveShadow = true

scene.add(sphere, plane)

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({

        // This option for baking is dynamic
        alphaMap: simpleShadow,
        color: 'black',
        // When you want to use alpha, transparency, opacity... you need
        // to set the transparency to true
        transparent: true
    })
)

sphereShadow.rotation.x = - Math.PI * 0.5
sphereShadow.position.y = plane.position.y + 0.01

scene.add(sphereShadow)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Shadows, Only PointLight, DirectionalLight and SpotLight support shadows
// Activate shadow
renderer.shadowMap.enabled = false


// Shadow map algorithm to improve shadow quality
// There is BasicShadowMap, PCFShadowMap, PCFSoftShadowMap and VSMShadowMap
// PCFSoftShadowMap is usually the prefered one
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Make the sphere rotate
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5

    // Make the sphere bounce
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))

    // Update the shadow position
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z

    // Update the shadow opacity on ball altitude
    // We add 1 at the beginning to have the position substracted from it
    sphereShadow.material.opacity = (1 - sphere.position.y) * 2
    console.log(sphereShadow.material.opacity)                                                       
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()