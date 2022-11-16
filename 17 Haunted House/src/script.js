import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

// Door loading
const doorColorTexture = textureLoader.load('/textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('/textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('/textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/textures/door/roughness .jpg')

// Bricks loading
const bricksColorTexture = textureLoader.load('/textures/bricks/color.jpg')
const bricksAmbientOcclusionTexture = textureLoader.load('/textures/bricks/ambientOcclusion.jpg')
const bricksNormalTexture = textureLoader.load('/textures/bricks/normal.jpg')
const bricksMetalnessTexture = textureLoader.load('/textures/bricks/metalness.jpg')
const bricksRoughnessTexture = textureLoader.load('/textures/bricks/roughness .jpg')

// Grass loading
const grassColorTexture = textureLoader.load('/textures/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('/textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('/textures/grass/normal.jpg')
const grassMetalnessTexture = textureLoader.load('/textures/grass/metalness.jpg')
const grassRoughnessTexture = textureLoader.load('/textures/grass/roughness .jpg')

// Repeat the textures into small sets
grassColorTexture.repeat.set(8, 8)
grassAmbientOcclusionTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassMetalnessTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

// By default the textures do nto repeat. We need to enable each texture to repeat 
grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassMetalnessTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

// Allow it on the other axes as well
grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassMetalnessTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

/**
 * House
 */

// Create a group which is going to belong to the House
const house = new THREE.Group()
scene.add(house)

// Walls 
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial(
        {
            map: bricksColorTexture,
            aoMap: bricksAmbientOcclusionTexture,
            normalMap: bricksNormalTexture,
            metalnessMap: bricksMetalnessTexture,
            roughnessMap: bricksRoughnessTexture,
            
        }
    )
)

walls.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)

walls.position.y = 2.5 / 2
house.add(walls)

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 4, 4),
    new THREE.MeshStandardMaterial({ color: 'brown' })
)
roof.rotation.y = Math.PI * 0.25
roof.position.y = 4 + 0.5
house.add(roof)

// Door

const door = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 2.2, 100, 100),
    new THREE.MeshStandardMaterial(
        {
            map: doorColorTexture,
            transparent: true,
            alphaMap: doorAlphaTexture,
            aoMap: doorAmbientOcclusionTexture,
            displacementMap: doorHeightTexture,
            displacementScale: 0.1,
            normalMap: doorNormalTexture,
            metalnessMap: doorMetalnessTexture,
            roughnessMap: doorRoughnessTexture

        }
    )
)

// aoMap requires the geometry to have the uv attribute set
door.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)

door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// Bushes

const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)

bush1.position.set(1.3, 0.1, 2.1)
bush1.scale.set(0.1, 0.2 ,0.1)

bush2.position.set(-1.3, 0.1, 2.1)
bush2.scale.set(0.25, 0.5 , 0.15)

bush3.position.set(1.6, 0.1, 2.1)
bush3.scale.set(0.25, 0.2 ,0.15)

house.add(bush1, bush2, bush3)

// Graves
const graves = new THREE.Group()
scene.add(graves)

const gravesGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2)
const gravesMaterial = new THREE.MeshStandardMaterial({ color: 'grey' })

for (let i = 0; 50 > i; i++) {

    // Random angle
    const angle = Math.random() * Math.PI * 2

    // Get a random value from 3 to 9
    const radius = 3 + Math.random() * 6                           

    // When you use the same value on Math.sin(x) and Math.cos(z)
    // you get all positions on a circle around the angle
    // We multiply it to magnify the sin and cos. By default,
    // both have the value of 1
    const x = Math.sin(angle) * radius 
    const z = Math.cos(angle) * radius 

    const grave = new THREE.Mesh(gravesGeometry, gravesMaterial)
    grave.position.set(x, 0.3, z)
    grave.rotation.y = (Math.random() - 0.5) * 0.85
    grave.rotation.z = (Math.random() - 0.5) * 0.3
    grave.castShadow = true

    graves.add(grave)
}

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial(
        {
            map: grassColorTexture,
            normalMap: grassNormalTexture,
            aoMap: grassAmbientOcclusionTexture,
            metalnessMap: grassMetalnessTexture,
            roughnessMap: grassRoughnessTexture,
        }
    )
)

floor.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0

scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.2)
moonLight.position.set(4, 5, - 2)

gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)

scene.add(moonLight)

// Door light
const doorLight = new THREE.PointLight('orange', 1.5, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

// Fog
const fog = new THREE.Fog('#262837', 1, 15)

// It is not added with the .add method
scene.fog = fog

// Ghost

const ghost1 = new THREE.PointLight('purple', 2, 5)
scene.add(ghost1)

const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
scene.add(ghost2)

const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
scene.add(ghost3)

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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
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
renderer.setClearColor('#262837')

// Shadows

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

moonLight.castShadow = true
doorLight.castShadow = true

ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true

floor.receiveShadow = true

// Optimize the shadow maps
doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7


ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7


ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()


    // Make ghost rotate the house
    const ghost1Angle = elapsedTime * 0.5

    ghost1.position.x = Math.cos(ghost1Angle) * 5
    ghost1.position.z = Math.sin(ghost1Angle) * 5
    ghost1.position.y = Math.sin(ghost1Angle * 3) 

    const ghost2Angle = - elapsedTime * 0.7

    ghost2.position.x = Math.cos(ghost2Angle) * 8
    ghost2.position.z = Math.sin(ghost2Angle) * 8
    ghost2.position.y = 1.5 - (Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5))

    const ghost3Angle = - elapsedTime * 0.18

    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = 3 - (Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2.5))



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()