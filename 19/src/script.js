import './style.css'
import * as THREE from 'three'
import { Clock } from 'three'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const windowSize = {
	width: window.innerWidth,
	height: window.innerHeight
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

let particleGeometry = null
let particleMaterial = null
let points = null

const destroyGalaxy = () => {
	// The mesh does not have to be disposed, just 
	// dispose of the geometry and material
	particleGeometry.dispose()
	particleMaterial.dispose()
	scene.remove(points)
}

const generateGalaxy = () => {

	// Destroy old galaxy if it exists
	if (points !== null) {
		destroyGalaxy()
	}

	const positions = new Float32Array(parameters.count * 3)
	const colors = new Float32Array(parameters.count * 3)

	const colorInside = new THREE.Color(parameters.insideColor)
	const colorOutside = new THREE.Color(parameters.outsideColor)

	particleGeometry = new THREE.BufferGeometry()

	const clock = new Clock()
	// Add the vertices to the buffer geometry
	for (let i = 0; i < parameters.count; i++) {
		const i3 = i * 3

		const elapsedTime = clock.getElapsedTime()

		// Position the particles randomly inside the values of the radius
		const radius = Math.random() * parameters.radius

		// The further from the centre, the faster the particle will spin
		const spinAngle = radius * parameters.spin

		//* Review the explanation
		const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

		const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
		const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
		const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

		// Fill the array for x, y and z
		//x
		positions[i3] = (Math.cos(branchAngle + spinAngle) * radius + randomX)
		//y
		positions[i3 + 1] = randomY
		//z
		positions[i3 + 2] = (Math.sin(branchAngle + spinAngle) * radius + randomZ)

		// When we lerp two colors, we change the color of the base(the one that executes .lerp)
		// we create a clone to keep the original color
		const mixedColor = colorInside.clone()
		mixedColor.lerp(colorOutside, radius / parameters.radius)

		//Fill the array for RGB. This is red
		colors[i3] = mixedColor.r
		colors[i3 + 1] = mixedColor.g
		colors[i3 + 2] = mixedColor.b
	}

	particleGeometry.setAttribute(
		'position',
		new THREE.BufferAttribute(positions, 3)
	)

	particleGeometry.setAttribute(
		'color',
		new THREE.BufferAttribute(colors, 3)
	)

	particleMaterial = new THREE.PointsMaterial(
		{
			size: parameters.size,
			sizeAttenuation: true,
			depthWrite: true,
			blending: THREE.AdditiveBlending,
			vertexColors: true
		}
	)

	points = new THREE.Points(particleGeometry, particleMaterial)
	scene.add(points)
}

addGuiParameters(parameters, generateGalaxy)


const { renderer, scene, controls, camera } = createRenderer()
generateGalaxy()

const clock = new THREE.Clock()

const tick = () =>
{
	const elapsedTime = clock.getElapsedTime()

	// Rotate galaxy
	points.rotation.y = Math.PI * elapsedTime * 0.05
	points.rotation.x = 0.5

	// Update controls
	controls.update()

	// Render
	renderer.render(scene, camera)

	// Call tick again on the next frame
	window.requestAnimationFrame(tick)
}

tick()