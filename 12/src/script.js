import './style.css';
import * as lil from 'lil-gui';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import matcapImgSrc from '../static/textures/matcaps/1.png';
import gradientImgSrc from '../static/textures/matcaps/2.png';
import colorImgSrc from '../static/textures/door/color.jpg';
import heightImgSrc from '../static/textures/door/height.jpg';
import alphaImgSrc from '../static/textures/door/alpha.jpg';
import normalImgSrc from '../static/textures/door/normal.jpg';
import ambientOclusionImgSrc from '../static/textures/door/ambientOcclusion.jpg';
import metalnessImgSrc from '../static/textures/door/metalness.jpg';
import roughnessImgSrc from '../static/textures/door/roughness.jpg';
import backgroundNXImgSrc from '../static/textures/environmentMaps/0/nx.jpg'
import backgroundNYImgSrc from '../static/textures/environmentMaps/0/ny.jpg'
import backgroundNZImgSrc from '../static/textures/environmentMaps/0/nz.jpg'
import backgroundPXImgSrc from '../static/textures/environmentMaps/0/px.jpg'
import backgroundPYImgSrc from '../static/textures/environmentMaps/0/py.jpg'
import backgroundPZImgSrc from '../static/textures/environmentMaps/0/pz.jpg'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// * Create debug UI
const gui = new lil.GUI();

// Scene
const scene = new THREE.Scene();

const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);

const matcapTexture = textureLoader.load(matcapImgSrc);
const gradientTexture = textureLoader.load(gradientImgSrc);
const colorTexture = textureLoader.load(colorImgSrc);
const heightTexture = textureLoader.load(heightImgSrc);
const alphaTexture = textureLoader.load(alphaImgSrc);
const normalTexture = textureLoader.load(normalImgSrc);
const metalnessTexture = textureLoader.load(metalnessImgSrc);
const roughnessTexture = textureLoader.load(roughnessImgSrc);
const ambientOclusionTexture = textureLoader.load(ambientOclusionImgSrc);

//* BasicMaterial
// const material = new THREE.MeshBasicMaterial(
//* You can pass the properties within the properties object when instantiating, or...
// {
//   map: matcapTexture,
//   color: 'red'
// }
// )

//* You can modify the properties later. Some come with some quirks, like color.
// material.map = colorTexture
// Not a color, but a Color class instance
// material.color = new THREE.Color('red')
// material.wireframe = true
// material.transparent = true
// material.opacity = .5
// material.alphaMap = alphaTexture
// material.side = THREE.BackSide

//* NormalMaterial, to debug normals
// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true

//* MatcapMaterial, to simulate light without having light in the scene.
//* It takes the normals of the texture
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexture

//* MeshDepthMaterial,
//* render will colour the material white if its in the Near and black if its in the Far
//* Useful to create fog and preprocessing
// const material = new THREE.MeshDepthMaterial()

//* The following materials require light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const light = new THREE.PointLight(0xffffff, 0.5)
light.position.x = 2
light.position.y = 3
light.position.z = 4
scene.add(light)


// * MeshLambertMaterial, reacts to light. The most performant
// * Can give some strange patterns on the geometry, like blurry lines
// const material = new THREE.MeshLambertMaterial()

// * MeshPhongMaterial, reacts to light. Less performant
// * Has no weird patterns and reflects light to the camera

// const material = new THREE.MeshPhongMaterial()
// * Change how bright the shiny part is
// material.shininess = 100
// * Change color of the shiny part
// material.specular = new THREE.Color(0xff000)

// * MeshToonMaterial, reacts to light.
// const material = new THREE.MeshToonMaterial()

// * This will make it look like gradient instead of toonish because the
// * gradient is small and magFilter tries to fix it with the mipmapping by
// * stretching the texture
// material.gradientMap = gradientTexture

// * Set the minFilter and magFilter to NearestFilter to restore it
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter

// * We can also deactive the mipmaps
// gradientTexture.generateMipmaps = false

// * MeshStandardMaterial, reacts to light, but with more realistic algo.
// * and better parameters like roughness and metalness. It uses PBR.
const material = new THREE.MeshStandardMaterial();

// * This should not be used along with maps
material.metalness = 0.7;
material.roughness = 0.2;

// material.map = colorTexture
// material.aoMap = ambientOclusionTexture
// material.aoMapIntensity = 1
// * Apply the height texture to each material.
// * To see which vertices should get the height applied
// * This should look bad if we have no vertices
// material.displacementMap = heightTexture

// * Adjust the multiplier for the scale of the vertices displacement
// material.displacementScale = 0.1

// * Apply the metalness, roughness and normal texture to each material. 
// * To see which vertices should get the metalness, roughness and which normals to apply.
// material.metalnessMap = metalnessTexture
// material.roughnessMap = roughnessTexture
// material.normalMap = normalTexture
// material.normalScale.set(0.5, 0.5)
// material.alphaMap = alphaTexture
// * To apply the alpha map, we need to set the transparent property to true
// * so only the white part of the image will be shown
// material.transparent = true

// * MeshPhysicalMaterial, same as Basic, but with a clear coat effect
// const material = new THREE.MeshPhysicalMaterial({map: colorTexture});
// const material = new THREE.MeshBasicMaterial({map: colorTexture});

// * Load environtment map. It requires a CubeTextureLoader
const cubeTextureLoader = new THREE.CubeTextureLoader()

// * Pass in all the images corresponding to the faces of the interior of the cube
// * The order is important. This will give the material the ability to reflect the image.

const environtmentMapTexture = cubeTextureLoader.load(
  [
    backgroundPXImgSrc,
    backgroundNXImgSrc,
    backgroundPYImgSrc,
    backgroundNYImgSrc,
    backgroundPZImgSrc,
    backgroundNZImgSrc
  ]
  )

// * Add the envMap to the material
material.envMap = environtmentMapTexture

gui.add(material, 'metalness').min(0).max(1).step(0.01);
gui.add(material, 'roughness').min(0).max(1).step(0.01);
// gui.add(material, 'aoMapIntensity').min(0).max(1).step(0.01);
// gui.add(material, 'displacementScale').min(0).max(1).step(0.01);

// * PointsMaterial
// const material = new THREE.PointsMaterial({map: colorTexture});

// * ShaderMaterial, to create your own material
// const material = new THREE.ShaderMaterial({map: colorTexture});



const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material);

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);

const torus = new THREE.Mesh(
	new THREE.TorusGeometry(0.3, 0.2, 64, 128),
	material
);

//  * MeshStandardMaterial also has access to the aoMap, giving shadows where the texture is dark.
//  * This requires a second set of UV coordinates.
// *  They can be accessed with meshInstance.geometry.attributes
sphere.geometry.setAttribute(
	'uv2',
	new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2)
);
plane.geometry.setAttribute(
	'uv2',
	new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2)
);
torus.geometry.setAttribute(
	'uv2',
	new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2)
);

scene.add(plane, sphere, torus);

sphere.position.set(-1.5, 0, 0);
torus.position.set(2, 0, 0);

/**
 * Sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

window.addEventListener('resize', () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 2;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update controls
	controls.update();

	//* Update objects
	torus.rotation.y = 0.3 * elapsedTime;
	plane.rotation.y = 0.3 * elapsedTime;
	sphere.rotation.y = 0.3 * elapsedTime;

	torus.rotation.x = 0.3 * elapsedTime;
	plane.rotation.x = 0.3 * elapsedTime;
	sphere.rotation.x = 0.3 * elapsedTime;

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();
