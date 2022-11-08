import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import * as dat from 'lil-gui'


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
// AmbientLight(minimal cost)
const ambientLight = new THREE.AmbientLight('0xffffff', 0.5)
//scene.add(ambientLight)

//// Directional Light (moderate cost)
const directionalLight = new THREE.DirectionalLight('blue', 1)
//directionalLight.position.set(1, 0.25, 0)
//scene.add(directionalLight)

//// Hemisphere Light, light coming from up and below (minimal cost)
const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x000ff, 0.3)
//scene.add(hemisphereLight)

// Point Light, like a lighter iluminating a place (moderate cost)
const pointLight = new THREE.PointLight(0xff9000, 0.5, 90)
//pointLight.position.set(1, -0.5, 1)
//scene.add(pointLight)

// RectArea Light, a plane iluminating a direction, just like a photo shoot
// only works with MeshStandardMaterial and MeshPhysicalMaterial (high cost)
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 6, 1)
rectAreaLight.position.set(-1.5, 0, 1)
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

// SpotLight, like a flashlight. To rotate it, you need to use its target property
// after adding it to the scene, because it's an Object3D, contrary to the other lights (high cost)
const spotLight = new THREE.SpotLight(0x78ff00, 0.5, 10, Math.PI * 0.19, 0.25, 1)
//scene.add(spotLight)

//scene.add(spotLight.target)
//spotLight.target.position.x = -0.75

// Baking - adding lights from an external 3D software to the textures

//* Helpers 
const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 0.2)
//scene.add(hemisphereLightHelper)

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 0.2)
//scene.add(directionalLightHelper)

const pointLightHelper = new THREE.PointLightHelper(pointLight)
//scene.add(pointLightHelper)

const spotLightHelper = new THREE.SpotLightHelper(spotLight)
//scene.add(spotLightHelper)

// Because of a bug, the helper is not well positioned, you need to update it
// on the next frame
//window.requestAnimationFrame(() => {
//    spotLightHelper.update()
//})

// This helper is not within the THREE class, you need to import it from /examples/
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight)
scene.add(rectAreaLightHelper)
//Tets git


/**
 * Objects
 */



// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.4

// Objects
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.position.x = - 1.5

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    material
)

const torus = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.2, 32, 64),
    material
)
torus.position.x = 1.5

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.65

scene.add(sphere, cube, torus, plane)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = 0.1 * elapsedTime
    cube.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    cube.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()