import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader'
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry'

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

const matcapTexture = textureLoader.load('/textures/matcaps/7.png')

// * Instantiate loader
const fontLoader = new FontLoader()
// * Load font
fontLoader.load(
  '/fonts/helvetiker_regular.typeface.json',
  (font) => {
    // * Same process with the rest of the meshes but with the
    // * TextGeometry class. The font imported is passed as a callback parameter
    // https://threejs.org/docs/#examples/en/geometries/TextGeometry
    const textGeometry = new TextGeometry(
      'Victor Martin',
      {
        font,
        size: 0.5,
        height: 0.2,
        curveSegments: 5,
        bevelEnabled: true,
        bevelThickness: 0.03, 
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 4
      }
    )
    // * Center the text
    textGeometry.computeBoundingBox()
    textGeometry.translate(
      - textGeometry.boundingBox.max.x * 0.5,
      - textGeometry.boundingBox.max.y * 0.5,
      - textGeometry.boundingBox.max.z * 0.5
    )
    textGeometry.center()
    
    const matcapMaterial = new THREE.MeshMatcapMaterial(
      {
        matcap: matcapTexture
      })

    const text = new THREE.Mesh(textGeometry, matcapMaterial)
    scene.add(text)

    // * No need for it to be inside the loop. 
    // * You can use the same geom and material for different meshes
    const donutGeometry = new THREE.TorusGeometry(0.1, 0.1, 20, 45)
    
    for(let i = 0; i < 100 ; i++)
    {
      const donut = new THREE.Mesh(donutGeometry, matcapMaterial)

      const positions = {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 10
      }

      donut.position.set(positions.x, positions.y, positions.z)
    
      donut.rotation.x = Math.random() * Math.PI
      donut.rotation.y = Math.random() * Math.PI

      const scale = Math.random()
      donut.scale.x = scale
      donut.scale.y = scale
      donut.scale.z = scale

      scene.add(donut)
    }
  }
  ) 

const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)



/**
 * Object
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

// scene.add(cube)

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()