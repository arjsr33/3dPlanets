// Enhanced Solar System Simulator
let scene, camera, renderer, sun, clock
let planets = []
let isPaused = false
let globalSpeedMultiplier = 1.0
let cameraAngle = 0.5 // Horizontal rotation angle
let cameraPhi = Math.PI / 3 // Vertical angle (60 degrees from top)
let cameraDistance = 50
let orbitTrails = []
let planetLabels = []
let selectedPlanet = null
let frameCount = 0
let lastFpsTime = 0
let currentFps = 60
let simulationTime = 0

// Enhanced planet data with real astronomical information
const planetData = [
  {
    name: 'Mercury',
    size: 0.4,
    distance: 6,
    speed: 4.74,
    color: 0x8c7853,
    info: {
      diameter: '4,879 km',
      distance: '57.9 million km from Sun',
      day: '58.6 Earth days',
      year: '88 Earth days',
      moons: 0,
      facts: 'Closest planet to the Sun with extreme temperature variations.'
    }
  },
  {
    name: 'Venus',
    size: 0.6,
    distance: 8,
    speed: 3.5,
    color: 0xffc649,
    info: {
      diameter: '12,104 km',
      distance: '108.2 million km from Sun',
      day: '243 Earth days',
      year: '225 Earth days',
      moons: 0,
      facts: 'Hottest planet in our solar system with a toxic atmosphere.'
    }
  },
  {
    name: 'Earth',
    size: 0.6,
    distance: 10,
    speed: 2.98,
    color: 0x6b93d6,
    info: {
      diameter: '12,756 km',
      distance: '149.6 million km from Sun',
      day: '24 hours',
      year: '365.25 days',
      moons: 1,
      facts: 'Our home planet, the only known planet with life.'
    }
  },
  {
    name: 'Mars',
    size: 0.5,
    distance: 12,
    speed: 2.41,
    color: 0xc1440e,
    info: {
      diameter: '6,792 km',
      distance: '227.9 million km from Sun',
      day: '24.6 hours',
      year: '687 Earth days',
      moons: 2,
      facts: 'The Red Planet with the largest volcano in the solar system.'
    }
  },
  {
    name: 'Jupiter',
    size: 1.2,
    distance: 16,
    speed: 1.31,
    color: 0xd8ca9d,
    info: {
      diameter: '142,984 km',
      distance: '778.5 million km from Sun',
      day: '9.9 hours',
      year: '11.8 Earth years',
      moons: 95,
      facts: 'Largest planet with a Great Red Spot storm larger than Earth.'
    }
  },
  {
    name: 'Saturn',
    size: 1.0,
    distance: 20,
    speed: 0.97,
    color: 0xfad5a5,
    info: {
      diameter: '120,536 km',
      distance: '1.43 billion km from Sun',
      day: '10.7 hours',
      year: '29.4 Earth years',
      moons: 146,
      facts: 'Famous for its spectacular ring system made of ice and rock.'
    }
  },
  {
    name: 'Uranus',
    size: 0.8,
    distance: 24,
    speed: 0.68,
    color: 0x4fd0e7,
    info: {
      diameter: '51,118 km',
      distance: '2.87 billion km from Sun',
      day: '17.2 hours',
      year: '84 Earth years',
      moons: 27,
      facts: 'Tilted on its side and rotates like a rolling ball.'
    }
  },
  {
    name: 'Neptune',
    size: 0.8,
    distance: 28,
    speed: 0.54,
    color: 0x4b70dd,
    info: {
      diameter: '49,528 km',
      distance: '4.5 billion km from Sun',
      day: '16.1 hours',
      year: '164.8 Earth years',
      moons: 16,
      facts: 'Windiest planet with speeds up to 2,100 km/h.'
    }
  }
]

// Initialization
function init () {
  showLoadingScreen()

  // Scene setup
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  // Set initial camera position using spherical coordinates
  updateCameraPosition()

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setClearColor(0x000000, 0)
  document.body.appendChild(renderer.domElement)

  clock = new THREE.Clock()

  // Enhanced lighting
  scene.add(new THREE.AmbientLight(0x404040, 0.3))

  const sunLight = new THREE.PointLight(0xffffff, 2, 100)
  sunLight.position.set(0, 0, 0)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 2048
  sunLight.shadow.mapSize.height = 2048
  scene.add(sunLight)

  createSun()
  createPlanets()
  createStarField()
  setupControls()
  setupEventListeners()

  // Hide loading screen after a delay
  setTimeout(() => {
    hideLoadingScreen()
    animate()
  }, 2000)
}

function updateCameraPosition () {
  camera.position.x =
    cameraDistance * Math.sin(cameraPhi) * Math.cos(cameraAngle)
  camera.position.y = cameraDistance * Math.cos(cameraPhi)
  camera.position.z =
    cameraDistance * Math.sin(cameraPhi) * Math.sin(cameraAngle)
  camera.lookAt(0, 0, 0)
}

function showLoadingScreen () {
  document.getElementById('loadingScreen').style.display = 'flex'
}

function hideLoadingScreen () {
  const loadingScreen = document.getElementById('loadingScreen')
  loadingScreen.style.opacity = '0'
  setTimeout(() => {
    loadingScreen.style.display = 'none'
  }, 500)
}

function createSun () {
  const sunGeo = new THREE.SphereGeometry(2, 32, 32)
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xffdd44,
    emissive: 0xffaa00,
    emissiveIntensity: 0.3
  })
  sun = new THREE.Mesh(sunGeo, sunMat)
  sun.name = 'Sun'
  scene.add(sun)

  // Sun glow effect
  const glowGeo = new THREE.SphereGeometry(2.5, 32, 32)
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xffdd44,
    transparent: true,
    opacity: 0.3
  })
  const sunGlow = new THREE.Mesh(glowGeo, glowMat)
  sun.add(sunGlow)
}

function createPlanets () {
  planetData.forEach((data, i) => {
    const geo = new THREE.SphereGeometry(data.size, 32, 32)
    const mat = new THREE.MeshLambertMaterial({ color: data.color })
    const planet = new THREE.Mesh(geo, mat)

    planet.position.x = data.distance
    planet.name = data.name
    planet.userData = data
    planet.castShadow = true
    planet.receiveShadow = true
    scene.add(planet)

    // Create orbit line
    createOrbitLine(data.distance)

    // Create orbit trail
    const trailGeometry = new THREE.BufferGeometry()
    const trailMaterial = new THREE.LineBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.3
    })
    const trail = new THREE.Line(trailGeometry, trailMaterial)
    scene.add(trail)
    orbitTrails.push({ trail, positions: [] })

    planets.push({
      mesh: planet,
      data: data,
      speed: data.speed * 0.01,
      angle: Math.random() * Math.PI * 2,
      originalSpeed: data.speed * 0.01
    })

    // Saturn rings
    if (data.name === 'Saturn') {
      const ringGeo = new THREE.RingGeometry(1.2, 1.8, 64)
      const ringMat = new THREE.MeshLambertMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      })
      const rings = new THREE.Mesh(ringGeo, ringMat)
      rings.rotation.x = Math.PI / 2
      planet.add(rings)
    }

    // Create planet label
    createPlanetLabel(planet, data.name)
  })
}

function createOrbitLine (distance) {
  const orbitGeo = new THREE.RingGeometry(distance - 0.02, distance + 0.02, 128)
  const orbitMat = new THREE.MeshBasicMaterial({
    color: 0x444444,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide
  })
  const orbit = new THREE.Mesh(orbitGeo, orbitMat)
  orbit.rotation.x = Math.PI / 2
  orbit.userData = { isOrbitLine: true }
  scene.add(orbit)
}

function createPlanetLabel (planet, name) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = 256
  canvas.height = 64

  context.fillStyle = 'rgba(0, 0, 0, 0.8)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  context.fillStyle = '#ffffff'
  context.font = 'bold 24px Orbitron'
  context.textAlign = 'center'
  context.fillText(name, canvas.width / 2, canvas.height / 2 + 8)

  const texture = new THREE.CanvasTexture(canvas)
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(4, 1, 1)
  sprite.position.y = planet.userData.size + 1.5
  sprite.userData = { isPlanetLabel: true }
  planet.add(sprite)
  planetLabels.push(sprite)
}

function createStarField () {
  const starsGeo = new THREE.BufferGeometry()
  const starVertices = []
  const starColors = []

  for (let i = 0; i < 1000; i++) {
    starVertices.push(
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 400
    )

    // Random star colors
    const color = new THREE.Color()
    color.setHSL(Math.random() * 0.2 + 0.5, 0.55, Math.random() * 0.25 + 0.55)
    starColors.push(color.r, color.g, color.b)
  }

  starsGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starVertices, 3)
  )
  starsGeo.setAttribute(
    'color',
    new THREE.Float32BufferAttribute(starColors, 3)
  )

  const starsMat = new THREE.PointsMaterial({
    size: 1.0,
    sizeAttenuation: false,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  })

  scene.add(new THREE.Points(starsGeo, starsMat))
}

function setupControls () {
  const container = document.getElementById('planetControls')

  planets.forEach((planet, i) => {
    const div = document.createElement('div')
    div.className = 'planet-control'
    div.innerHTML = `
            <div class="planet-info" data-planet="${i}">
                <div class="planet-color" style="background-color: #${planet.data.color
                  .toString(16)
                  .padStart(6, '0')}"></div>
                <div class="planet-name">${planet.data.name}</div>
            </div>
            <div class="speed-controls">
                <input type="range" class="speed-slider" id="speed-${i}" min="0" max="5" step="0.1" value="${
      planet.data.speed * 0.01
    }">
                <div class="speed-value" id="display-${i}">${(
      planet.data.speed * 0.01
    ).toFixed(1)}x</div>
            </div>
        `
    container.appendChild(div)

    // Speed slider event
    document.getElementById(`speed-${i}`).addEventListener('input', e => {
      planet.speed = parseFloat(e.target.value)
      document.getElementById(`display-${i}`).textContent =
        planet.speed.toFixed(1) + 'x'
    })

    // Planet info click event
    div.querySelector('.planet-info').addEventListener('click', () => {
      showPlanetInfo(planet.data)
    })
  })

  // Global speed control
  document.getElementById('globalSpeed').addEventListener('input', e => {
    globalSpeedMultiplier = parseFloat(e.target.value)
    document.getElementById('globalSpeedValue').textContent =
      globalSpeedMultiplier.toFixed(1) + 'x'
  })
}

function setupEventListeners () {
  // Main control buttons
  document.getElementById('pauseBtn').addEventListener('click', togglePause)
  document.getElementById('resetBtn').addEventListener('click', resetSimulation)

  // View controls
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      document
        .querySelectorAll('.view-btn')
        .forEach(b => b.classList.remove('active'))
      e.target.classList.add('active')
      setCameraView(e.target.dataset.view)
    })
  })

  // Display options
  document
    .getElementById('showOrbits')
    .addEventListener('change', toggleOrbitLines)
  document
    .getElementById('showNames')
    .addEventListener('change', togglePlanetNames)
  document
    .getElementById('showTrails')
    .addEventListener('change', toggleOrbitTrails)

  // Mouse controls
  setupMouseControls()

  // Keyboard controls
  document.addEventListener('keydown', handleKeyboard)

  // Window resize
  window.addEventListener('resize', onWindowResize)

  // Modal controls
  document.querySelector('.close').addEventListener('click', closePlanetModal)
  window.addEventListener('click', e => {
    if (e.target === document.getElementById('planetModal')) {
      closePlanetModal()
    }
  })
}

function setupMouseControls () {
  let dragging = false
  let lastMouse = { x: 0, y: 0 }

  renderer.domElement.addEventListener('mousedown', e => {
    dragging = true
    lastMouse = { x: e.clientX, y: e.clientY }
    document.body.classList.add('grabbing')
  })

  renderer.domElement.addEventListener('mousemove', e => {
    if (dragging) {
      const dx = e.clientX - lastMouse.x
      const dy = e.clientY - lastMouse.y
      const speed = 0.01

      // Update spherical coordinates
      cameraAngle -= dx * speed
      cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi - dy * speed))

      // Update camera position
      updateCameraPosition()

      lastMouse = { x: e.clientX, y: e.clientY }
    }

    // Enhanced tooltip
    updateTooltip(e)
  })

  renderer.domElement.addEventListener('mouseup', () => {
    dragging = false
    document.body.classList.remove('grabbing')
  })

  renderer.domElement.addEventListener('wheel', e => {
    e.preventDefault()
    const zoomSpeed = 0.1
    const zoom = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed
    cameraDistance *= zoom
    cameraDistance = Math.max(15, Math.min(100, cameraDistance))

    // Update camera position using spherical coordinates
    updateCameraPosition()
  })

  // Planet clicking
  renderer.domElement.addEventListener('click', e => {
    if (!dragging) {
      const mouse = new THREE.Vector2()
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, camera)
      const planetMeshes = planets.map(p => p.mesh)
      const intersects = raycaster.intersectObjects(planetMeshes)

      if (intersects.length > 0) {
        const planet = intersects[0].object
        showPlanetInfo(planet.userData)
      }
    }
  })
}

function updateTooltip (e) {
  const mouse = new THREE.Vector2()
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)
  const intersectObjects = [sun, ...planets.map(p => p.mesh)]
  const intersects = raycaster.intersectObjects(intersectObjects)

  const tooltip = document.getElementById('tooltip')

  if (intersects.length > 0) {
    const object = intersects[0].object
    const title = object.name === 'Sun' ? 'Sun' : object.userData.name
    const details =
      object.name === 'Sun'
        ? 'Our star • Diameter: 1.39 million km • Surface temp: 5,778 K'
        : `Distance: ${object.userData.info.distance} • Day: ${object.userData.info.day}`

    tooltip.querySelector('.tooltip-title').textContent = title
    tooltip.querySelector('.tooltip-details').textContent = details
    tooltip.style.display = 'block'
    tooltip.style.left = e.clientX + 15 + 'px'
    tooltip.style.top = e.clientY - 15 + 'px'
  } else {
    tooltip.style.display = 'none'
  }
}

function handleKeyboard (e) {
  switch (e.code) {
    case 'Space':
      e.preventDefault()
      togglePause()
      break
    case 'KeyR':
      resetSimulation()
      break
    case 'Digit1':
      setCameraView('default')
      break
    case 'Digit2':
      setCameraView('top')
      break
    case 'Digit3':
      setCameraView('side')
      break
  }
}

function togglePause () {
  isPaused = !isPaused
  const btn = document.getElementById('pauseBtn')
  if (isPaused) {
    btn.innerHTML =
      '<span class="btn-icon">▶️</span><span class="btn-text">Resume</span>'
    btn.classList.add('pause')
  } else {
    btn.innerHTML =
      '<span class="btn-icon">⏸️</span><span class="btn-text">Pause</span>'
    btn.classList.remove('pause')
  }
}

function resetSimulation () {
  planets.forEach((planet, i) => {
    planet.speed = planet.originalSpeed
    planet.angle = Math.random() * Math.PI * 2
    document.getElementById(`speed-${i}`).value = planet.speed
    document.getElementById(`display-${i}`).textContent =
      planet.speed.toFixed(1) + 'x'
  })

  globalSpeedMultiplier = 1.0
  document.getElementById('globalSpeed').value = 1.0
  document.getElementById('globalSpeedValue').textContent = '1.0x'

  simulationTime = 0

  // Clear orbit trails
  orbitTrails.forEach(trail => {
    trail.positions = []
    trail.trail.geometry.setFromPoints([])
  })
}

function setCameraView (view) {
  const duration = 1000 // Animation duration in ms
  let targetDistance, targetAngle, targetPhi

  switch (view) {
    case 'top':
      targetDistance = 60
      targetAngle = cameraAngle // Keep current horizontal angle
      targetPhi = 0.1 // Almost straight down
      break
    case 'side':
      targetDistance = 60
      targetAngle = cameraAngle // Keep current horizontal angle
      targetPhi = Math.PI / 2 // Side view
      break
    default: // Slight angle for nice default view
      targetDistance = 50
      targetAngle = 0.5
      targetPhi = Math.PI / 3 // 60 degrees from top
  }

  // Store initial values
  const startDistance = cameraDistance
  const startAngle = cameraAngle
  const startPhi = cameraPhi

  // Smooth camera transition
  const startTime = Date.now()
  function animateCamera () {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)

    // Interpolate spherical coordinates
    cameraDistance = startDistance + (targetDistance - startDistance) * eased
    cameraAngle = startAngle + (targetAngle - startAngle) * eased
    cameraPhi = startPhi + (targetPhi - startPhi) * eased

    // Update camera position using spherical coordinates
    updateCameraPosition()

    if (progress < 1) {
      requestAnimationFrame(animateCamera)
    }
  }
  animateCamera()
}

function easeInOutCubic (t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

function toggleOrbitLines () {
  const show = document.getElementById('showOrbits').checked
  scene.children.forEach(child => {
    if (child.userData && child.userData.isOrbitLine) {
      child.visible = show
    }
  })
}

function togglePlanetNames () {
  const show = document.getElementById('showNames').checked
  planetLabels.forEach(label => {
    label.visible = show
  })
}

function toggleOrbitTrails () {
  const show = document.getElementById('showTrails').checked
  orbitTrails.forEach(trail => {
    trail.trail.visible = show
  })
}

function showPlanetInfo (planetData) {
  const modal = document.getElementById('planetModal')
  const title = document.getElementById('modalTitle')
  const body = document.getElementById('modalBody')

  title.textContent = planetData.name
  body.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                <strong>Diameter:</strong> ${planetData.info.diameter}<br>
                <strong>Distance from Sun:</strong> ${
                  planetData.info.distance
                }<br>
                <strong>Day Length:</strong> ${planetData.info.day}
            </div>
            <div>
                <strong>Year Length:</strong> ${planetData.info.year}<br>
                <strong>Moons:</strong> ${planetData.info.moons}<br>
                <strong>Color:</strong> <span style="color: #${planetData.color
                  .toString(16)
                  .padStart(6, '0')}">#${planetData.color
    .toString(16)
    .padStart(6, '0')}</span>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <strong>Interesting Facts:</strong><br>
            ${planetData.info.facts}
        </div>
    `

  modal.style.display = 'block'

  // Update info panel
  document.getElementById('infoPanel').innerHTML = `
        <strong>${planetData.name}</strong><br>
        ${planetData.info.facts}
    `
}

function closePlanetModal () {
  document.getElementById('planetModal').style.display = 'none'
}

function updateStats () {
  frameCount++
  const now = performance.now()

  if (now >= lastFpsTime + 1000) {
    currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime))
    document.getElementById('fpsCounter').textContent = currentFps
    frameCount = 0
    lastFpsTime = now
  }

  document.getElementById('timeCounter').textContent =
    Math.floor(simulationTime) + 's'
}

function updateOrbitTrails () {
  if (!document.getElementById('showTrails').checked) return

  planets.forEach((planet, index) => {
    const trail = orbitTrails[index]
    const pos = planet.mesh.position.clone()

    trail.positions.push(pos)

    // Limit trail length
    if (trail.positions.length > 200) {
      trail.positions.shift()
    }

    // Update trail geometry
    if (trail.positions.length > 1) {
      trail.trail.geometry.setFromPoints(trail.positions)
    }
  })
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate () {
  requestAnimationFrame(animate)

  if (!isPaused) {
    const delta = clock.getDelta()
    simulationTime += delta

    // Rotate sun
    sun.rotation.y += delta * 0.5

    // Update planets
    planets.forEach((planet, index) => {
      const effectiveSpeed = planet.speed * globalSpeedMultiplier
      planet.angle += delta * effectiveSpeed

      planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance
      planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance
      planet.mesh.rotation.y += delta * 2
    })

    updateOrbitTrails()
  }

  updateStats()
  renderer.render(scene, camera)
}

// Initialize when page loads
window.addEventListener('load', init)
