import * as t from 'three'
import gsap from 'gsap'


const config = {
    sizes: {
        width: 800,
        height: 600,
    }
}

// scene and content
const scene = new t.Scene()

const axesHelper = new t.AxesHelper(2)
scene.add(axesHelper)

const boxGeometry = new t.BoxGeometry(1, 1, 1)
const boxMaterial = new t.MeshBasicMaterial({color: 0xff0000})
const box = new t.Mesh(boxGeometry, boxMaterial)
box.position.set(0.7, -0.6, 1)

const boxGeometry2 = new t.BoxGeometry(1, 1, 1)
const boxMaterial2 = new t.MeshBasicMaterial({color: 0xff0000})
const box2 = new t.Mesh(boxGeometry, boxMaterial)
box2.position.set(-1, 0.6, 1)

const group = new t.Group()
group.add(box)
group.add(box2)

// camera
const camera = new t.PerspectiveCamera(75, config.sizes.width / config.sizes.height)
camera.position.z = 3

// add to scene
scene.add(group)
scene.add(camera)

// setup canvas
const canvas = document.querySelector("canvas#scene")
const renderer = new t.WebGLRenderer({canvas,})
renderer.setSize(config.sizes.width, config.sizes.height)

renderer.render(scene, camera)

// let clock = new t.Clock()

gsap.to(box.position, { duration: 1, delay: 1, x: 2 })
gsap.to(box2.position, { duration: 1, delay: 1, x: 2 })


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
    // camera.lookAt(box.position)

    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()
