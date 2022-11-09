import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { Clock } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Comment lost in refactoring

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

        // Update camera aspect ratio
        camera.aspect = sizesObject.width / sizesObject.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizesObject.width, sizesObject.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
}

const createRenderer = (sizesObject = windowSize) => {
    const scene = new THREE.Scene()
    const camera = createCamera(scene)
    const canvas = document.querySelector('canvas.webgl')
    const renderer = new THREE.WebGLRenderer({ canvas })
    const controls = createControls(camera, canvas)

    renderer.setSize(sizesObject.width, sizesObject.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

const createAppGUI = (parameters) => {
    const gui = new dat.GUI({ width: 500 })

    gui.add(parameters, 'count')
        .min(100)
        .max(1000000)
        .step(100)

    gui.add(parameters, 'size')
        .min(0.001)
        .max(0.1)
        .step(0.001)

    gui.add(parameters, 'radius')
        .min(0.01)
        .max(20)
        .step(0.01)

    gui.add(parameters, 'branches')
        .min(2)
        .max(20)
        .step(1)

    gui.add(parameters, 'spin')
        .min(- 5)
        .max(5)
        .step(1)

    gui.add(parameters, 'randomness')
        .min(0)
        .max(2)
        .step(0.01)

    gui.add(parameters, 'randomnessPower')
        .min(1)
        .max(10)
        .step(0.01)

    gui.addColor(parameters, 'insideColor')
        .min(1)
        .max(10)
        .step(0.01)

    gui.addColor(parameters, 'outsideColor')
        .min(1)
        .max(10)
        .step(0.01)
    return gui
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

    //! Review why are we dividing by the two radiuses
    return mixedColor.lerp(colorOutside, radius / parameters.radius)

}

const fillColorsArray = (colors, mixedColor, vertex) => {
    // Fill the buffered array for RGB.
    // These are taken from the mix of the inside and outside
    // colors in the parameters object
    colors[vertex] = mixedColor.r
    colors[vertex + 1] = mixedColor.g
    colors[vertex + 2] = mixedColor.b
}

const generateRandomCoords = (parameters, radius) => {
    const { randomnessPower } = parameters
    const altitude = (Math.random() * 0.5 - radius)
    const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
    const randomY = Math.pow(Math.random(), randomnessPower) * ((Math.random() < 0.5 ? 1 : -1)) / altitude
    const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

    return { randomX, randomY, randomZ }
}

const generateBranchAngle = (index, parameters) => {
    const branchesAmount = parameters.branches
    // Given that the array contains vertices stored in groups of 3 indexes...

    // GET IN WHICH BRANCH DOES THE PARTICLE BELONG
    // - We are going to target each vertex by substracting the modulo of
    // the current index divided by the amount of branches selected by the user

    // - It will point to the next one on the next vertex, until the iteration is done.

    // - The result will never surpass the amount of branches, the result of the index will be
    // at one point the same as the one of the amount of branches, thus returning the value
    // to 0 and adding the particle to the branch 0 all over again

    // example with 3 branches
    // vertex 0 1 2 3 4 5 6 7 8 9 10 11
    // branch 0 1 2 0 1 2 0 1 2 0 1  2

    // GET THE ANGLE WHERE THE PARTICLE HAS TO BE PLACED (ANGLE OF THE BRANCH)
    // We want the full circle of the galaxy to take the value 1.
    // We then divide by the same branchesAmount to get a value from 0 to 1,
    // each fraction corresponding to the radiant that will belong to each branch.
    // That way we know the angle where the particle has to be placed.
    // This is a decimal
    const branchToTarget = (index % branchesAmount) / branchesAmount

    // Default value to get the amount of radiants on a circle
    const totalValueOfAllRadiants = Math.PI * 2

    // The value of the full circle multiplied (actually divided) by the decimal number,
    // We take a fraction from the total value.
    const radiantToPlaceBranch = totalValueOfAllRadiants * branchToTarget 

    return radiantToPlaceBranch
}

const generateSpinAngle = (randomCoordsInRadius, parameters) => {
    const staticSpinValue = parameters.spin 

    // The coords will be higher the further they are from the center
    // because the values on the centre are 0
    // The further from the centre, the faster the particle will spin
    return staticSpinValue * randomCoordsInRadius  
}

const fillPositionX = (totalAngle, randomCoordsInRadius) => {
    // 
    return Math.cos(totalAngle) * randomCoordsInRadius
}

const fillPositionZ = (totalAngle, randomCoordsInRadius) => {
    return Math.sin(totalAngle) * randomCoordsInRadius
}

const rotateGalaxy = (galaxy, elapsedTime) => {
    galaxy.rotation.y = Math.PI * elapsedTime * 0.05
    galaxy.rotation.x = 0.5
}

const generateGalaxy = () => {
    const { count, radius } = parameters

    // Destroy old galaxy if it exists
    if (points !== null) {
        destroyGalaxy()
    }

    // Assign to 2 Float32Arrays the length they will have, which is
    // the number of stars times the amount of vertices each one will hold
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    // Add the vertices to the buffer geometry
    for (let i = 0; i < count; i++) {

        // The array contains vertices stored in groups of 3 indexes,
        // which contain X - Y - Z values of the vertex
        const vertexParticleX = i * 3
        const vertexParticleY = vertexParticleX + 1
        const vertexParticleZ = vertexParticleY + 1

        // Get a random value between 0 and the length of
        // the radius, where the particle will be positioned
        const randomCoordsInRadius = Math.random() * radius

        const branchAngle = generateBranchAngle(i, parameters)
        const spinAngle = generateSpinAngle(randomCoordsInRadius, parameters)

        // We make values that were placed further
        // from the centre move inwards to give that speed effect
        // We would substract if we wanted the branches to tend to the other direction 
        const branchAngleWithSpin = branchAngle + spinAngle

        const { randomX, randomY, randomZ } = generateRandomCoords(parameters, randomCoordsInRadius)
        const radiusRandomX = randomX - randomCoordsInRadius
        const radiusRandomZ = randomZ - randomCoordsInRadius

        // This is just for one vertex
        positions[vertexParticleX] = fillPositionX(branchAngleWithSpin, radiusRandomX)
        positions[vertexParticleY] = randomY
        positions[vertexParticleZ] = fillPositionZ(branchAngleWithSpin, radiusRandomZ)

        const mixedColor = mixColors(parameters, randomCoordsInRadius)
        fillColorsArray(colors, mixedColor, vertexParticleX)
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

const initApp = () => {
    const elapsedTime = clock.getElapsedTime()
    rotateGalaxy(points, elapsedTime)
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(initApp)
}

const { renderer, scene, controls, camera } = createRenderer()

const gui = createAppGUI(parameters)

// Here we add onFinishChange(callback) whenever the values on parameters are tweaked, 
// regenerate the galaxy, so the tweaked values are not added onto the old ones
gui.onFinishChange(generateGalaxy)

generateGalaxy()

initApp()