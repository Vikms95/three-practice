import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'
import { ACESFilmicToneMapping, sRGBEncoding } from 'three'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}




// Loader
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()


// Canvas
const canvas = document.querySelector( 'canvas.webgl' )

// Scene
const scene = new THREE.Scene()

const environtmentMap = cubeTextureLoader.load( [
  '/textures/environmentMaps/3/px.jpg',
  '/textures/environmentMaps/3/nx.jpg',
  '/textures/environmentMaps/3/py.jpg',
  '/textures/environmentMaps/3/ny.jpg',
  '/textures/environmentMaps/3/pz.jpg',
  '/textures/environmentMaps/3/nz.jpg',
] )

environtmentMap.encoding = sRGBEncoding
scene.background = environtmentMap

debugObject.envMapIntensity = 5
console.log( debugObject )

// Traverse the whole model scene to apply the environtmap
// Traverse method on the scene is a recursive method
function updateAllMaterials () {
  scene.traverse( child => {
    if ( child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial ) {

      // Already setup on the THREE.js scene object
      //child.material.envMap = environtmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }

  } )
}

gui.add( debugObject, 'envMapIntensity' ).min( 0 ).max( 10 ).step( 0.001 ).onChange( updateAllMaterials )


// Scene here refers to the property of the gltf object, not the Three.js scene
gltfLoader.load(
  'models/hamburger.glb',
  ( gltf ) => {
    gltf.scene.scale.set( 0.3, 0.3, 0.3 )
    gltf.scene.position.set( 0, -4, 0 )
    gltf.scene.rotation.y = Math.PI * 0.5

    scene.add( gltf.scene )

    gui.add( gltf.scene.rotation, 'y' )
      .min( - Math.PI )
      .max( Math.PI )
      .step( 0.001 )
      .name( 'rotation' )

    // Traverse all the scene
    updateAllMaterials()

  }
)

/**
 * Test sphere
 */
const testSphere = new THREE.Mesh(
  new THREE.SphereGeometry( 1, 32, 32 ),
  new THREE.MeshStandardMaterial()
)
scene.add( testSphere )

// This is a way to add the environtment map 
// to each material contained within the THREE scene
scene.environment = environtmentMap

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
camera.position.set( 4, 1, - 4 )
scene.add( camera )


// Light
const directionalLight = new THREE.DirectionalLight( '#ffffff', 4 )
directionalLight.position.set( 0.25, 3, -2.25 )
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set( 1024, 1024 )
directionalLight.shadow.normalBias = 0.05
scene.add( directionalLight )

// To see where shadows from the light are casted
//const directionalLightCameraHelper = new THREE.CameraHelper( directionalLight.shadow.camera )
//scene.add( directionalLightCameraHelper )

gui.add( directionalLight, 'intensity' ).min( 0 ).max( 10 ).step( 0.1 ).name( 'lightIntensity' )
gui.add( directionalLight.position, 'x' ).min( - 5 ).max( 5 ).step( 0.1 ).name( 'lightX' )
gui.add( directionalLight.position, 'y' ).min( - 5 ).max( 5 ).step( 0.1 ).name( 'lightY' )
gui.add( directionalLight.position, 'z' ).min( - 5 ).max( 5 ).step( 0.1 ).name( 'lightZ' )

// Controls
const controls = new OrbitControls( camera, canvas )
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer( {
  canvas: canvas,
  antialias: true
} )
renderer.setSize( sizes.width, sizes.height )
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )
renderer.physicallyCorrectLights = true
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap


gui.add( renderer, 'toneMapping', {
  No: THREE.NoToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Linear: THREE.LinearToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACES: THREE.ACESFilmicToneMapping,
} )

gui.add( renderer, 'toneMappingExposure' ).min( 0 ).max( 10 ).step( 0.001 )

// This improves the quality of the visuals a lot
// by giving more range of colors to the colors that the eye can actually see
renderer.outputEncoding = THREE.sRGBEncoding
/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Render
  renderer.render( scene, camera )

  // Call tick again on the next frame
  window.requestAnimationFrame( tick )
}

tick()