import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

// Texture loader
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load( 'textures/gradients/3.jpg' )
// With
gradientTexture.magFilter = THREE.NearestFilter

gui
    .addColor( parameters, 'materialColor' )
    .onChange( () =>
    {
        material.color.set( parameters.materialColor )
        particleMaterial.color.set( parameters.materialColor )

    })

/**
 * Base
 */

// Canvas
const canvas = document.querySelector( 'canvas.webgl' )

// Scene
const scene = new THREE.Scene()


// Light

const directionalLight = new THREE.DirectionalLight( 'white', 1 )
directionalLight.position.set( 1, 1, 0 )
scene.add( directionalLight )


/**
 * Object
 */

const material = new THREE.MeshToonMaterial(
    {
        color: parameters.materialColor,

        // WEBGL will try to merge the pixels from the gradient if we do it like this
        // we use NearestFilter, so it chooses one and it does not merge them. It
        // chooses the pixel that is closer, but just one
        gradientMap: gradientTexture
    }
)

const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry( 1, 0.4, 16, 60 ),
    material
)

const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry( 1, 2, 32 ),
    material
)

const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry( 0.8, 0.35, 100, 16 ),
    material
)

const objectsDistance = 4

mesh1.position.y = - objectsDistance * 0
mesh1.position.x = - 1.8
mesh2.position.y = - objectsDistance * 1
mesh2.position.x = 1.8
mesh3.position.y = - objectsDistance * 2
mesh3.position.x = - 1.8

scene.add( mesh1, mesh2, mesh3 )

const sectionMeshes = [ mesh1, mesh2, mesh3 ]

// Particles
const particlesCount = 300
const particleGeometry = new THREE.BufferGeometry()
const particleMaterial = new THREE.PointsMaterial(
    {
        color: '#ffeded',
        size: 0.03,
        sizeAttenuation: true
    }
)

const positions = new Float32Array( particlesCount * 3 )
particleGeometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) )

const particles = new THREE.Points( particleGeometry, particleMaterial )
scene.add( particles )
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener( 'resize', () =>
{
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

// Group
const group = new THREE.Group()
scene.add( group )


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera( 35, sizes.width / sizes.height, 0.1, 100 )
camera.position.z = 6
group.add( camera )

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer( {
    canvas,
    alpha: true
} )
renderer.setSize( sizes.width, sizes.height )
renderer.setPixelRatio( Math.min( window.devicePixelRatio, 2 ) )

// Scroll
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener( 'scroll', ( event ) =>
{

    scrollY = window.scrollY

    // We divide the place where we are scrolled by the height of the viewport
    // to get on how many viewports (or meshes) fit in the total scrollable field
    // We then round the number to get a value from 0 to 2, so we can later use it
    // to point a value within the meshes array
    const newSection = Math.round( scrollY / sizes.height )

    // Modify the current section if it is not the one that it is already set to
    if ( newSection != currentSection )
    {
        currentSection = newSection
        gsap.to(
            sectionMeshes[ currentSection ].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5',
            }
        )
    }


} )

// Cursor
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener( 'mousemove', ( event ) =>
{

    // We divide by the size of the window to normalize the values
    // so they are between 0 to 1
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
} )

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    console.log( deltaTime )
    for ( let i = 0; i < particlesCount; i++ )
    {
        positions[ i * 3 + 0 ] = ( Math.random() - 0.5 ) * 10

        // We make the dots congregate on the meshes by taking the distance set between the objects
        // The last value is the number of values that you want to spread the dots across
        positions[ i * 3 + 1 ] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
        positions[ i * 3 + 2 ] = ( Math.random() - 0.5 ) * 10
    }





    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5

    // We substract the value from the cursor to the value of the group, so
    // we give an 'easing' effect to the movement. Decrease the multiplier
    // number to increase the smoothing effect
    group.position.x += ( parallaxX - group.position.x ) * 0.02
    group.position.y += ( parallaxY - group.position.y ) * 0.02

    //Animate meshes
    for ( const mesh of sectionMeshes )
    {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render( scene, camera )

    // Call tick again on the next frame
    window.requestAnimationFrame( tick )
}

tick()