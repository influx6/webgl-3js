import * as t from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui';
import gsap from 'gsap'


const config = {
    sizes: {
        width: window.innerWidth,
        height: window.innerHeight,
    },
    cursor: {
        x: 0,
        y: 0,
    }
}

const gui = new dat.GUI()

// scene and content
const scene = new t.Scene()


const axesHelper = new t.AxesHelper(2)
scene.add(axesHelper)

const boxGeometry = new t.BoxGeometry(1, 1, 1)


const boxParameters = {color: 0xff0000}
gui.addColor(boxParameters, "color").onChange(() => {
    boxMaterial.color.set(boxParameters.color)
})

const boxMaterial = new t.MeshBasicMaterial(boxParameters)
const box = new t.Mesh(boxGeometry, boxMaterial)
box.position.set(0.7, -0.6, 1)

gui.add(box.position, 'x', -3, 3, 0.01)
gui.add(box.position, 'y', -3, 3, 0.01)
gui.add(box.position, 'z').min(-3).max(3).step(0.01).name("Box1-Z")


const boxGeometry2 = new t.BoxGeometry(1, 1, 1)
const boxMaterial2 = new t.MeshBasicMaterial({color: 0xff0000, wireframe: true})
const box2 = new t.Mesh(boxGeometry2, boxMaterial2)
box2.position.set(-1, 0.6, 1)

// Create an empty BufferGeometry
const geometry = new t.BufferGeometry()

// Create a Float32Array containing the vertices position (3 by 3)
const positionsArray = new Float32Array([
    0, 0, 0, // First vertex
    0, 1, 0, // Second vertex
    1, 0, 0  // Third vertex
])

// Create the attribute and name it 'position'
const positionsAttribute = new t.BufferAttribute(positionsArray, 3)
geometry.setAttribute('position', positionsAttribute)

const lineGeometryMaterial = new t.MeshBasicMaterial({color: 0xff0000, wireframe: true})
const triangle = new t.Mesh(geometry, lineGeometryMaterial)
// triangle.position.set(-2, 0.3, 1)

const group = new t.Group()
group.add(box)
group.add(box2)
group.add(triangle)

// camera
const camera = new t.PerspectiveCamera(75, config.sizes.width / config.sizes.height, 1, 1000)
camera.position.z = 3

// add to scene
scene.add(group)
scene.add(camera)

// setup canvas
const canvas = document.querySelector("canvas#scene")
const renderer = new t.WebGLRenderer({canvas,})
renderer.setSize(config.sizes.width, config.sizes.height)


const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true


window.addEventListener('mouseover', (event) => {
    config.cursor.x = (event.clientX / config.sizes.width) - 0.5
    config.cursor.y = -1 * (event.clientX / config.sizes.height - 0.5)
})

window.addEventListener('resize', () => {
    // Update sizes
    config.sizes.width = window.innerWidth;
    config.sizes.height = window.innerHeight;

    // update camera
    camera.aspect = config.sizes.width / config.sizes.height;
    camera.updateProjectionMatrix();

    // update renderer
    renderer.setSize(config.sizes.width, config.sizes.height);

    // update pixel
    // To get the screen pixel ratio you can use window.devicePixelRatio , and to update the pixel ratio of your renderer,
    // you simply need to call the renderer.setPixelRatio(...)
    // You might be tempted to simply send the device pixel ratio to that method, but you'll end up with performance
    // issues on high pixel ratio devices.
    // Having a pixel ratio greater than 2 is mostly marketing. Your eyes will see almost no difference between 2 and 3
    // but it will create performance
    // issues and empty the battery faster. What you can do is limit the pixel ratio to 2.
    // To do that, you can use Math.min():
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if (!fullscreenElement) {
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen()
        }
    }
})
controls.target.y = 2

const tick = () => {

    // const deltaTime = clock.getElapsedTime()
    //
    // box.rotation.y += 0.01 * deltaTime
    // box.position.x = Math.cos(deltaTime)
    // box.position.y = Math.sin(deltaTime)
    //
    // box2.rotation.y += 0.02 * deltaTime
    // box2.position.x = Math.cos(deltaTime)
    // box2.position.y = Math.sin(deltaTime)
    //
    // camera.position.x = Math.cos(deltaTime)
    // camera.position.y = Math.sin(deltaTime)

    // update position only
    // camera.position.x = config.cursor.x
    // camera.position.y = config.cursor.y

    // update position in a circular rotation around subject
    // camera.position.x = Math.sin(config.cursor.x * Math.PI * 2) * 2
    // camera.position.y = Math.sin(config.cursor.y * Math.PI * 2) * 2
    // camera.position.z = config.cursor.y * 3

    controls.update()

    // select object to focus camera on
    // camera.lookAt(box.position)

    // update pixel
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()
