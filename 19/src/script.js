import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { Clock } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Comment lost in refactoring
// The further from the centre, the faster the particle will spin

// Instantiate a Clock for the whole function to later use it as a rotation reference
const clock = new Clock()

let points = null
let particleGeometry = null
let particleMaterial = null

const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
}

const createControls = (camera, canvas) => {
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    return controls
}

const createCamera = (sceneToAdd, sizes = windowSize) => {
    const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 3
    camera.position.y = 3
    camera.position.z = 3
    sceneToAdd.add(camera)
    return camera
}

const addResponsiveWindow = (sizesObject, camera, renderer) => {
    window.addEventListener('resize', () => {
        // Update sizes
        sizesObject.width = window.innerWidth
        sizesObject.height = window.innerHeight

        // Update camera
        camera.aspect = sizesObject.width / sizesObject.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizesObject.width, sizesObject.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
}

const createRenderer = (sizesObject = windowSize) => {
    const canvas = document.querySelector('canvas.webgl')
    const renderer = new THREE.WebGLRenderer({ canvas })
    renderer.setSize(sizesObject.width, sizesObject.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene = new THREE.Scene()
    const camera = createCamera(scene)
    const controls = createControls(camera, canvas)
    addResponsiveWindow(sizesObject, camera, renderer)

    return { scene, renderer, controls, camera }
}

const parameters = {
    count: 250000,
    size: 0.02,
    radius: 4,
    branches: 4,
    spin: 1,
    randomness: 0.02,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
}

const addGuiParameters = (parameters, refreshFunction) => {
    const gui = new dat.GUI({ width: 500 })

    // Here we add onFinishChange(callback) whenever the values on parameters are tweaked, regenerate the galaxy
    gui.add(parameters, 'count')
        .min(100)
        .max(1000000)
        .step(100)
        .onFinishChange(refreshFunction)

    gui.add(parameters, 'size')
        .min(0.001)
        .max(0.1)
        .step(0.001)
        .onFinishChange(refreshFunction)

    gui.add(parameters, 'radius')
        .min(0.01)
        .max(20)
        .step(0.01)
        .onFinishChange(refreshFunction)

    gui.add(parameters, 'branches')
        .min(2)
        .max(20)
        .step(1)
        .onFinishChange(refreshFunction)

    gui.add(parameters, 'spin')
        .min(- 5)
        .max(5)
        .step(1)
        .onFinishChange(refreshFunction)

    gui.add(parameters, 'randomness')
        .min(0)
        .max(2)
        .step(0.01)
        .onFinishChange(refreshFunction)

    gui.add(parameters, 'randomnessPower')
        .min(1)
        .max(10)
        .step(0.01)
        .onFinishChange(refreshFunction)

    gui.addColor(parameters, 'insideColor')
        .min(1)
        .max(10)
        .step(0.01)
        .onFinishChange(refreshFunction)

    gui.addColor(parameters, 'outsideColor')
        .min(1)
        .max(10)
        .step(0.01)
        .onFinishChange(refreshFunction)

}

const destroyGalaxy = () => {
    // The mesh does not have to be disposed, just 
    // dispose of the geometry and material
    particleGeometry.dispose()
    particleMaterial.dispose()
    scene.remove(points)
}

const setBufferGeometryAttribute = (geometry, attribute, array, vertexSize) => {
    geometry.setAttribute(
        attribute,
        new THREE.BufferAttribute(array, vertexSize)
    )
}

const mixColors = (parameters, radius) => {
    // Assign Color class to an object with the colors taken from the parameters
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    // When we lerp two colors, we change the color of the base one (the one that executes .lerp),
    // so we create a clone to keep the original color
    const mixedColor = colorInside.clone()

    // Review why are we dividing by the two radiuses
    return mixedColor.lerp(colorOutside, radius / parameters.radius)

}

const fillColorsArray = (colors, mixedColor, vertex) => {
    //Fill the array for RGB. This is red
    colors[vertex] = mixedColor.r
    colors[vertex + 1] = mixedColor.g
    colors[vertex + 2] = mixedColor.b
}

const generateRandomCoords = (parameters) => {
    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

    return { randomX, randomY, randomZ }
}

const generateBranchAngle = (index, parameters) => {
    //* Review the explanation
    return (index % parameters.branches) / parameters.branches * Math.PI * 2
}

const generateSpinAngle = (radius, parameters) => {
    return radius * parameters.spin
}

const fillPositionX = (totalAngle, radiusRandom) => {
    return (Math.cos(totalAngle) * radiusRandom)
}

const fillPositionZ = (totalAngle, radiusRandom) => {
    return (Math.sin(totalAngle) * radiusRandom)
}


const generateGalaxy = () => {

    // Destroy old galaxy if it exists
    if (points !== null) {
        destroyGalaxy()
    }

    // Assign to 2 Float32Arrays the length they will have, which is
    // the number of stars times the amount of vertices each one will hold
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    // Add the vertices to the buffer geometry
    for (let i = 0; i < parameters.count; i++) {
        const vertex = i * 3

        // Position the particles randomly inside the values of the radius
        const radius = Math.random() * parameters.radius

        const mixedColor = mixColors(parameters, radius)

        fillColorsArray(colors, mixedColor, vertex)

        const branchAngle = generateBranchAngle(i, parameters)
        const spinAngle = generateSpinAngle(radius, parameters)
        const totalAngle = branchAngle + spinAngle

        const randomCoords = generateRandomCoords(parameters)
        const radiusRandomX = radius + randomCoords.randomX
        const radiusRandomZ = radius + randomCoords.randomZ 

        positions[vertex] = fillPositionX(totalAngle, radiusRandomX)
        positions[vertex + 1] = randomCoords.randomY
        positions[vertex + 2] = fillPositionZ(totalAngle, radiusRandomZ)
    }

    // Assign the Buffer Geometry and the material
    particleGeometry = new THREE.BufferGeometry()
    particleMaterial = new THREE.PointsMaterial(
        {
            depthWrite: true,
            vertexColors: true,
            sizeAttenuation: true,
            size: parameters.size,
            blending: THREE.AdditiveBlending,
        }
    )

    setBufferGeometryAttribute(particleGeometry, 'position', positions, 3)
    setBufferGeometryAttribute(particleGeometry, 'color', colors, 3)

    // Same process as with a Mesh
    points = new THREE.Points(particleGeometry, particleMaterial)
    scene.add(points)
}


const { renderer, scene, controls, camera } = createRenderer()

addGuiParameters(parameters, generateGalaxy)

generateGalaxy()

// Rotate galaxy
const rotateGalaxy = (galaxy, time) => {
    galaxy.rotation.y = Math.PI * time * 0.05
    galaxy.rotation.x = 0.5
}

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    rotateGalaxy(points, elapsedTime)
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()