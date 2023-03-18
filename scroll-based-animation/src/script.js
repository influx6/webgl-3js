import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()
const parameters = {
    materialColor: '#ffeded',
    objectsDistance: 4,
    cameraWiggle: 5,
    amplitude: 0.5,
    particlesCount: 1000,
}

/**
 * Cursor
 */
const cursor = {
    x: 0,
    y: 0,
}

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5

})

let scrolls = {
    scrollY: window.scrollY,
    scrollX: window.scrollX,
    currentSection: 0,
    newSection: 0,
}


window.addEventListener("scroll", () => {
  scrolls =   {
      scrollY: window.scrollY,
      scrollX: window.scrollX,
      newSection: Math.round(scrollY / sizes.height),
  }

  if (scrolls.newSection != scrolls.currentSection) {
      scrolls.currentSection = scrolls.newSection

      gsap.to(
          sectionMeshes[scrolls.currentSection].rotation,
          {
              duration: 1.5,
              ease: 'power2.inOut',
              x: '+=6',
              y: '+=3',
              z: '+=1.5'
          }
      )
  }
})

gui
    .addColor(parameters, 'materialColor')
    .onChange(() =>
    {
        material.color.set(parameters.materialColor)
        particlesMaterial.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter


/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: '#ff0000' })
// )
// scene.add(cube)

const material = new THREE.MeshToonMaterial({ color: parameters.materialColor, gradientMap: gradientTexture, })

/**
 * Objects
 */
// Meshes
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material,
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material,
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material,
)

const sectionMeshes = [ mesh1, mesh2, mesh3 ]

// mesh1.position.y = 2
// mesh1.scale.set(0.5, 0.5, 0.5)
//
// mesh2.visible = false
//
// mesh3.position.y = - 2
// mesh3.scale.set(0.5, 0.5, 0.5)

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2

mesh1.position.y = -1 * parameters.objectsDistance * 0
mesh2.position.y = -1 * parameters.objectsDistance * 1
mesh3.position.y = -1 * parameters.objectsDistance * 2

scene.add(mesh1, mesh2, mesh3)



// Particles
const positions = new Float32Array(parameters.particlesCount * 3)
for(let i = 0; i < parameters.particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = parameters.objectsDistance * 0.5 - Math.random() * parameters.objectsDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
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


// Camera Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setClearAlpha(0)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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

    // Animate camera
    camera.position.y = - ((scrolls.scrollY / sizes.height) * parameters.objectsDistance)

    const parallaxX = cursor.x * parameters.amplitude
    const parallaxY = - cursor.y * parameters.amplitude

    // First try - linear movement
    // cameraGroup.position.x += parallaxX
    // cameraGroup.position.y += parallaxY

    // Second try - adding distance easing
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * parameters.cameraWiggle * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * parameters.cameraWiggle * deltaTime

    // To animate the mesh to follow the scroll,
    // just set the y position as the scrollY
    // mesh1.position.y =  scrolls.scrollY

    // Animate meshes
    for(const mesh of sectionMeshes)
    {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()