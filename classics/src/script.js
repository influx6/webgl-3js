import * as t from 'three'

const config = {
    sizes: {
        width: 800,
        height: 600,
    }
}


// scene and content
const scene = new t.Scene()

const boxGeometry = new t.BoxGeometry(1, 1, 1)
const boxMaterial = new t.MeshBasicMaterial({color: 0xff0000})
const box = new t.Mesh(boxGeometry, boxMaterial)

// camera
const camera = new t.PerspectiveCamera(75, config.sizes.width / config.sizes.height)
camera.position.z = 3

// add to scene
scene.add(box)
scene.add(camera)

// setup canvas
const canvas = document.querySelector("canvas#scene")
const renderer = new t.WebGLRenderer({ canvas, })
renderer.setSize(config.sizes.width, config.sizes.height)

renderer.render(scene, camera)
