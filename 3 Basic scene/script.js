// Create scene
const scene = new THREE.Scene()

// Create and configure camera(field of view, aspect ratio)
const sizes =  {
  width: 800,
  height: 600
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5

// Create renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas') 
})

// Resize renderer to fit camera size
renderer.setSize(sizes.width, sizes.height)

// Create geometry, material and mix them in the mesh to create the object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({color: 'yellow'})
const mesh = new THREE.Mesh(geometry, material)

// Add camera to scene

scene.add(camera)

// Add any meshes needed to the scene
scene.add(mesh)


// Render the scene with the camera created
renderer.render(scene, camera)

// * Extra * //

// Create our own color
const createdColor = new THREE.Color('rgb(255, 0, 0)')