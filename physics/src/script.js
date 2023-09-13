import * as THREE from 'three'
import CANNON from 'cannon'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}
debugObject.createSphere = () => {
    // createSphere(0.5, {x: 0, y: 3, z: 0})
    createSphere(
        Math.random() * 0.5,
        {
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
    )
}
gui.add(debugObject, 'createSphere')

// Reset
debugObject.reset = () =>
{
    console.log('reset')
    for(const object of objectsToUpdate)
    {
        // Remove body
        world.removeBody(object.body)

        // Remove mesh
        scene.remove(object.mesh)
    }
    objectsToUpdate.splice(0, objectsToUpdate.length)
}
gui.add(debugObject, 'reset')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/** \
 Phyics
*/
const world = new CANNON.World()
world.gravity.set(0, -9.82, 0)

// performance steps:
//
// 1. switch broadphase algorithmn to most performant
world.broadphase = new CANNON.SAPBroadphase(world)

// 2. Enable allowSleep to ensure only bodys that are collided against or are moving are calculated
world.allowSleep = true

const baseMaterial = new CANNON.Material('default')

const defaultMaterial = new CANNON.ContactMaterial(
    baseMaterial,
    baseMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.defaultContactMaterial = defaultMaterial

// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0,3,0),
//     // material: baseMaterial,
//     shape: sphereShape,
// })
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
// world.addBody(sphereBody)

const plainShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
    mass: 0,
    // material: baseMaterial
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
floorBody.addShape(plainShape)
world.addBody(floorBody)

const objectsToUpdate = []

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5
})

const createSphere = (radius, position) =>
{
    // Three.js mesh
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.scale.set(radius, radius, radius)
    mesh.position.copy(position)
    scene.add(mesh)

    // Cannon.js body
    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape: shape,
        material: defaultMaterial
    })
    body.position.copy(position)
    world.addBody(body)

    objectsToUpdate.push({ mesh, body })
}

/**
 * Test sphere
 */
createSphere(0.5, { x: 0, y: 3, z: 0 })

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

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
camera.position.set(- 3, 3, 3)
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
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0;

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

    // Update controls
    controls.update()

    // sphereBody.applyForce(new CANNON.Vec3(- 0.5, 0, 0), sphereBody.position)

    // Update physics
    world.step(1/60, deltaTime, 3)

    // Update models
    // sphere.position.copy(sphereBody.position)
    // floor.position.copy(floorBody.position)
    for (const object of objectsToUpdate) {
        object.mesh.position.copy(object.body.position)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
