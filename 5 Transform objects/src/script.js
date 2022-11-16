import './style.css'
import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 'white' })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})

renderer.setSize(sizes.width, sizes.height)

/**
 ** Vector position methods
**/

//* Get length of vector
console.log(mesh.position.length())

//* Get distance between any other object (or scene and camera)
console.log(mesh.position.distanceTo(camera.position))
console.log(camera.position.distanceTo(scene.position))

//* Reduce the vector until the length is 1
// mesh.position.normalize()
console.log(mesh.position.length())

//* Set all positions in one method
mesh.position.set(1, -1, 0)

//* Create an axis visual helper. The length of the lines is
//* equivalent to one unit
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

//* How many units is one unit of the mesh equivalent to 
mesh.scale.x = 2
mesh.scale.y = 1

//* There is also a set method shorthand for it
// mesh.scale.set()

//* Rotation -  To determine which axis is rotating,
//*  imagine moving the object with a stick on the desired movement direction.
//* The position where the stick would be is the axis you need to touch 
//* (side? = x, top/bot? = y, face or back? = z)
//* x = pollastre a l'as, y = microwave, z = ventilador
// mesh.rotation.x = 2
// // Rotate half a circle
// mesh.rotation.y = Math.PI / 2

// // Playing with PI
// mesh.rotation.x = Math.PI * .25

/*CHANGING ONE AXIS MIGHT CHANGE THE REST, 
SO BE CAREFUL WITH THE ORDER OF ROTATIONS */
// The solution is to rearrange the order while thinking which face
// the camera is less likely to face as the one that would cause the gimbal lock. 
// Put that axis as the parent of the hierarchy.
mesh.rotation.reorder('YXZ')
mesh.rotation.x = 2
mesh.rotation.y = Math.PI / 2

// * Pointing something to a Vector3 (.lookAt)
// Make camera look at the right
// camera.lookAt(new THREE.Vector3(3, 0, 0))

// Make camera look at the position property of 
// the created mesh object, which is a Vector3
// camera.lookAt(mesh.position)

// * Groups (to apply transformations to a group of objects within)
// * Like parts of a starship, which can be moved individually but you
// * can move them all together by changing the parts placed within the
// * Starship group

// Create group and it to the scene
const group = new THREE.Group()
scene.add(group)

// Another way of instantiating a Mesh, 
// with its geometry and material declared inside as params
const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.MeshBasicMaterial({color:'red'})
)

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.MeshBasicMaterial({color:'blue'})
)

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1,1,1),
  new THREE.MeshBasicMaterial({color:'yellow'})
)

// Set the positions of the cube individually
// even if they are inside a group already
cube2.position.set(1.5,0,0)
cube3.position.set(2.5,0,)

group.rotation.x = .5
// group.rotation.y = .5

group.add(cube1, cube2, cube3)

// Move all the objects in the group down altogether
// group.position.X = -.9


renderer.render(scene, camera)

