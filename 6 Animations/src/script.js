import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material1 = new THREE.MeshBasicMaterial({ color: 'red' })
const material2 = new THREE.MeshBasicMaterial({ color: 'yellow' })
const mesh1 = new THREE.Mesh(geometry, material1)
const mesh2 = new THREE.Mesh(geometry, material2)
scene.add(mesh1)
scene.add(mesh2)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

//* / Animations(requestAnimationFrame)
// Base of animation is creating a recursive function that
// requests the next animation frame on the next animation frame

// Animate with Date.now()
// let time = Date.now()

// Animate with THREE.Clock()
let clock = new THREE.Clock()

// Animate with GSAP library 
gsap.to(mesh1.position, {duration: 1, delay: 1, x: 2})

const tick = () => {
  
  // Make animation speed independent of user framerate with Date.now()
  // const currentTime = Date.now()

  // Use it as a multiplier of each animation
  // const deltaTime = currentTime - time
  // time = currentTime

  // // console.log(time)
  // console.log(deltaTime)

  
  // Make animation speed independent of user framerate with THREE.Clock()
  const elapsedTime = clock.getElapsedTime()
  
  // Update objects
  // mesh1.position.x =  Math.sin(elapsedTime + 500)
  // mesh1.position.y =  Math.cos(elapsedTime + 500)

  // mesh2.position.x =  Math.sin(-elapsedTime- 500)
  // mesh2.position.y =  Math.cos(-elapsedTime- 500)

  // mesh1.rotation.z = elapsedTime
  // mesh1.rotation.x = -elapsedTime

  // mesh2.rotation.z = -elapsedTime
  // mesh2.rotation.x = elapsedTime
  
  // Recursive function
  window.requestAnimationFrame(tick)

  renderer.render(scene, camera)
}

tick()


