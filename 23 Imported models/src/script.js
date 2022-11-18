import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Needed to use the Draco loader
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'

/**
 * Base
 */

// Worth using if you have a big amount of geometries,
// geometries around 150kb or more.. around that. DRACO
// might create a small freeze at the beginning
const dracoLoader = new DRACOLoader()

// We have passed the draco folder from node_modules/three/examples/js/libs
// and passed it to the static folder. Then we load the whole
// folder here
dracoLoader.setDecoderPath( '/draco/' )


// GLTFLoader
const gltfLoader = new GLTFLoader()

// Now the meshes loaded with gltfLoader are much lighter
// if we use the DRACO version of it. If not, the DRACO loader
// will be ignored
gltfLoader.setDRACOLoader( dracoLoader )

// Load default model. This method can take 3 callbacks.
//gltfLoader.load( '/models/FlightHelmet/glTF/FlightHelmet.gltf',
//  ( gltf ) => {
// There is usually more than one Mesh in the children index, so not a good option
//scene.add( gltf.scene.children[ 0 ] )

//const childrenLength = gltf.scene.children.length

// Scene.add removes indexes from the array, so we end
// up with an array with lower length than the one we started with
// and will not add all the elements
//for ( let i = 0; i < childrenLength; i++ ) {
//  scene.add( gltf.scene.children[ i ] )
//}

// While loop is more appropiate for this use case
//while ( gltf.scene.children.length ) {
//  scene.add( gltf.scene.children[ 0 ] )
//}

// We can also duplicate the array with the spread operator
// and use a for loop
//const children = [ ...gltf.scene.children ]
//for ( const child of children ) {
//  scene.add( child )
//}

// Or add the whole scene
//scene.add( gltf.scene )
//},

// **DRACO EXAMPLE**
// Smaller by compressing the buffer data
//gltfLoader.load(
//  '/models/Duck/glTF-Draco/Duck.gltf',
//  ( gltf ) => {
//    scene.add( gltf.scene )
//  },
//  ( progress ) => {
//    console.log( 'progress' )
//    console.log( progress )
//  },
//  ( error ) => {
//    console.log( 'error' )
//    console.log( error )
//  },

//)

// Animations - Fox gltf has animations, composed of multiple AnimationClips
// We need to create an AnimationMixer. This is like a player that will contain the clips
// Instantiate it outside the loader so we can update it on the tick function
let mixer;

gltfLoader.load(
  '/models/Fox/glTF/Fox.gltf',
  ( gltf ) => {

    // Assign mixer
    mixer = new THREE.AnimationMixer( gltf.scene )

    // Add the first animation to the mixer
    const action = mixer.clipAction( gltf.animations[ 2 ] )

    action.play()

    gltf.scene.scale.set( '0.025', '0.025', '0.025' )
    scene.add( gltf.scene )
  }
)


// Debug
const gui = new dat.GUI()


// Canvas
const canvas = document.querySelector( 'canvas.webgl' )

// Scene
const scene = new THREE.Scene()

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry( 10, 10 ),
  new THREE.MeshStandardMaterial( {
    color: '#444444',
    metalness: 0,
    roughness: 0.5
  } )
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add( floor )

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight( 0xffffff, 0.8 )
scene.add( ambientLight )

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.6 )
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set( 1024, 1024 )
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set( 5, 5, 5 )
scene.add( directionalLight )

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener( 'resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize( sizes.width, sizes.height )
  renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )
} )

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera( 75, sizes.width / sizes.height, 0.1, 100 )
camera.position.set( 2, 2, 2 )
scene.add( camera )

// Controls
const controls = new OrbitControls( camera, canvas )
controls.target.set( 0, 0.75, 0 )
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer( {
  canvas: canvas
} )
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize( sizes.width, sizes.height )
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Update mixer. It might be null on load, so wrap it on a clause guard
  if ( mixer ) mixer.update( deltaTime )

  // Update controls
  controls.update()

  // Render
  renderer.render( scene, camera )

  // Call tick again on the next frame
  window.requestAnimationFrame( tick )
}

tick()