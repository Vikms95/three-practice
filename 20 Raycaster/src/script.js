import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { Ray } from 'three'

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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)


/**
 * Raycaster
 * 
 * // Useful to detect a wall in front of a player
 * // If the laser of a gun has hit something
 * // If something currently under the mouse to simulate mouse events
 * // Show an alert if the spaceship is heading towards a planet
 * */

//const raycaster = new THREE.Raycaster()
//const rayOrigin = new THREE.Vector3(-4, 0, 0)
//const rayDirection = new THREE.Vector3(10, 0, 0)

// Here the vector 3 is turned into a unit vector where the length will be 1. 
// This is just to indicate where that vector is pointing to (a normalized vector)
//rayDirection.normalize()

//raycaster.set(rayOrigin, rayDirection)


// Test if an object is intersected. intersectObject/s return an array of object.
// The reason the singular version returns an array is because a ray can intersect an object multiple times(if they have a hole)
//const intersect = raycaster.intersectObject(object2)
//console.log(intersect)

//const intersects = raycaster.intersectObjects([object1, object2, object3])
//console.log(intersects)

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
camera.position.z = 3
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
const objects = [object1, object2, object3]

const cursor = new THREE.Vector2()

window.addEventListener('mousemove', (e) => {
    cursor.x = event.clientX / sizes.width * 2 - 1

    // We wrap with parentheses and negate so we can have the positive value when the cursor is at the top
    // and the negative when its on the bottom
    cursor.y = - (event.clientY / sizes.height) * 2 + 1
    console.log(cursor)
})

let lastSeenObject = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate
    object1.position.y = Math.sin(elapsedTime * 1.5)
    object2.position.y = Math.sin(elapsedTime * 2)
    object3.position.y = Math.sin(elapsedTime * 3.5)

    //Raycaster
    const raycaster = new THREE.Raycaster()
    //const rayOrigin = new THREE.Vector3(-3, 0, 0)
    //const rayDirection = new THREE.Vector3(10, 0, 0).normalize()


    //Mouse version
    raycaster.setFromCamera(cursor, camera)

    //Fixed raycaster version
    //raycaster.set(rayOrigin, rayDirection)

    const intersectingObjects = raycaster.intersectObjects([object1, object2, object3])

    objects.forEach(object => {
        object.material.color.set(new THREE.Color('red'))
        intersectingObjects.forEach(intersection => {
            if (intersection.object === object) {
                lastSeenObject = object
                object.material.color.set(new THREE.Color('skyblue'))
            } else {
                lastSeenObject = null
            }
        })
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()