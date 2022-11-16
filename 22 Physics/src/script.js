import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import CANNON from 'cannon'
/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}

debugObject.createSphere = () =>
{
    createSphere( Math.random() * 0.5,
        {
            x: ( Math.random() - 0.5 ) * 3,
            y: 5 - ( Math.random() - 0.5 ) * 3,
            z: (Math.random() -  0.5) * 3
        } )   
}

gui.add( debugObject, 'createSphere' )

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()



const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

//** Physics **/

// Just like a scene in Three
const world = new CANNON.World()
world.gravity.set( 0, -2.82, 0 )

// To change the friction and boucning, we first need to create new instances of Material 
const defaultMaterial = new CANNON.Material( 'default' )

// We create a ContactMaterial to specify how will two materials interact with each other.
// Here we simplify the exercice and set how the 'default' material will interact with another
// default material. You can use different ones. This is good when you have a simple 3D space
// with no material specifications
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        // The higher the friction, more momentum they will loose when rubbing against each other
        friction: 0.1,

        // The higher the restituion, the Bodies will keep its momentum if they collide face to face.
        // Otherwise they will loose it.
        // == 1; it wont loose any momentum
        // > 1; it will gain momentum on each collision
        restitution: 0.5
    }
)

// We also need to add the behaviour to the world with addContactMaterial
//world.addContactMaterial( concretePlasticContactMaterial )

// We can also just change the property defaultContactMaterial of the World
// This way, all Bodies from the World will have this material assigned to it
world.defaultContactMaterial = defaultContactMaterial 

// In Cannon we create Body, which is like a mesh
// We create a Shape first (just like in Three you would first create a geometry)
//const sphereShape = new CANNON.Sphere( 0.5 )
//const sphereBody = new CANNON.Body( {
//    // Ej: If we have two objects colliding, the one with higher mass will
//    // push the other one
//    mass: 1,
//    position: new CANNON.Vec3( 0, 2, 0 ),
//    shape: sphereShape,
//    // Not needed if we use world.defaultContactMaterial
//    //material: defaultMaterial
//} )

//// Apply a force to the sphere Body
//sphereBody.applyLocalForce( new CANNON.Vec3( 150, 0, 0 ), new CANNON.Vec3( 0, 0, 0 ) )
//// Just like in Three, you add Body(Mesh) to the World(Scene),
//// but with addBody
//world.addBody( sphereBody )

// Add physics and collision to the floor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body( {
// Mass 0 makes it not move no matter what happens in the World
    mass: 0,
    shape: floorShape,
    // Not needed if we use world.defaultContactMaterial
    //material: defaultMaterial
})

floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3( -1, 0, 0 ),
    Math.PI * 0.5
)
world.addBody(floorBody)

/**
 * Test sphere
 */
//const sphere = new THREE.Mesh(
//    new THREE.SphereGeometry(0.5, 32, 32),
//    new THREE.MeshStandardMaterial({
//        metalness: 0.3,
//        roughness: 0.4,
//        envMap: environmentMapTexture,
//        envMapIntensity: 0.5
//    })
//)
//sphere.castShadow = true
//sphere.position.y = 0.5
//scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Array to apply positions to each one of the objects in the tick function
const objectsToUpdate = []

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20 )
const sphereMaterial = new THREE.MeshStandardMaterial( {
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
} )
//** Utils */
const createSphere = (radius, position) =>
{
    // Create Three Mesh
    const mesh = new THREE.Mesh( sphereGeometry, sphereMaterial )
    mesh.scale.set(radius, radius, radius)

    mesh.castShadow = true
    mesh.position.copy( position )
    scene.add( mesh )

    // Create Cannon Body
    const shape = new CANNON.Sphere()
    const body = new CANNON.Body( {
        mass: 1,
        shape,
        material: defaultMaterial
    } )

    body.position.copy( position )
    world.addBody( body )

    // Save in objectsToUpdate for later use. We
    // push an object with the Mesh and the Body
    objectsToUpdate.push( {mesh: mesh, body: body} )

}

createSphere( 0.5, {x:0, y:3, z:0})
createSphere( 0.5, {x:2, y:3, z:0})
createSphere( 0.5, {x:4, y:3, z:0})

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update physics world

    // Apply wind force on each frame. When the momentum from the localForce ends,
    // this one will cause the ball to move the opposite side
    //sphereBody.applyForce( new CANNON.Vec3(- 0.5, 0, 0), sphereBody.position )

    //1 If we want the app to run at 60 frames, we should indicate 1/60
    //2 Time passed since the last frame (deltaTime)
    //3 Number of frames that you give to the physics world in case of delay
    world.step( 1 / 60, deltaTime, 3 )
    
    for ( const object of objectsToUpdate )
    {
        object.mesh.position.copy( object.body.position )
    }

    // Apply physics world update to the scene
    //sphere.position.copy( sphereBody.position )
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()