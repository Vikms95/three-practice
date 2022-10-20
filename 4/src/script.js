import './style.css'
import * as THREE from 'three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight)
camera.position.z = 5

const geometry = new THREE.BoxGeometry(1,2,1)
const material = new THREE.MeshBasicMaterial({color: 'red'})
const mesh = new THREE.Mesh(geometry, material)

scene.add(camera)
scene.add(mesh)

const renderer = new THREE.WebGLRenderer({canvas: document.querySelector('canvas')})
renderer.setSize(window.innerWidth, window.innerHeight)


renderer.render(scene, camera)
