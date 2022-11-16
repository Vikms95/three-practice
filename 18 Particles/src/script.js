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
const starTexture = textureLoader.load('/textures/particles/2.png')

// Particle
//We can create particle just like Meshes, but with the Points class instead

const count = 5000 
const particleGeometry = new THREE.BufferGeometry(1, 32, 32)
const particleMaterial = new THREE.PointsMaterial(
    {
        transparent: true,
        alphaMap: starTexture,
        size: 0.5,

        // Same size regardless of the distance if checked as false
        sizeAttenuation: true
    })

// Using alpha test to add transparency. It's a valye between 0 and 1.
// It enables WebGL to know when not to render a pixel according to that pixel's transparency
// It will not render black zones on the alpha map. It is not the most precise, the user might still look
// some weird opacities.
//particleMaterial.alphaTest = 0.0001

// Using depth test. WebGL will tests if what is being drawn is closer than what
// is already drawn. Deactivate it along with removing the alpha test.
// This unfortunately creates bug with other geometries.
//particleMaterial.depthTest = false

// Using depth write. The depth of what is being drawn is stored in what we call
// a depth buffer. Instead of not testing if the particle is closer than what's in this depth buffer,
// we can tell the WebGL not to write particles in that depth buffer with depthTest
// This is usually the best solution, but it still might cause bugs.
particleMaterial.depthWrite = false

// Using blending. The less performant. When there are multiple particles on the same pixel,
// its adding the color. It does not draw a pixel on top of the other, it adds the color of the created
// pixel to the one behind it. It combines light.
particleMaterial.blending = THREE.AdditiveBlending

// Create a special array which needs to be size of the amount of particles +
// times 3 to store the x, y, z values => [x, y, z, x, y, z, x, y, z...]
const positions = new Float32Array(count * 3)

// We can also use a Float32Array of 3 positions because colors are composed of RGB.
// Each 'vertex' also goes from 0 to 1
const colors = new Float32Array(count * 3)

// We need to enable this property to allow colors to vertices
particleMaterial.vertexColors = true

// Assing random positions
for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 50
    colors[i] = Math.random()
}

// Set the position with the random values
particleGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)

particleGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
)

const particle = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particle)

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

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    for (let i = 0; i < count; i++) {

        // Travel trough indexes 3 by 3
        const i3 = i * 3

        // This a bad solution. It's better to use a custom shader(but harder)
        const x = particleGeometry.attributes.position.array[i3]
        particleGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
    }

    // Let Three know that this particle needs to get updated
    particleGeometry.attributes.position.needsUpdate = true
    
    // Animate particles
    //particle.rotation.y = elapsedTime * 0.2



    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()