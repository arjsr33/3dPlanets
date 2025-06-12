let scene, camera, renderer, sun, clock;
let planets = [];
let isPaused = false;

const planetData = [
    { name: 'Mercury', size: 0.4, distance: 6, speed: 2.0, color: 0x8c7853 },
    { name: 'Venus', size: 0.6, distance: 8, speed: 1.5, color: 0xffc649 },
    { name: 'Earth', size: 0.6, distance: 10, speed: 1.0, color: 0x6b93d6 },
    { name: 'Mars', size: 0.5, distance: 12, speed: 0.8, color: 0xc1440e },
    { name: 'Jupiter', size: 1.2, distance: 16, speed: 0.4, color: 0xd8ca9d },
    { name: 'Saturn', size: 1.0, distance: 20, speed: 0.3, color: 0xfad5a5 },
    { name: 'Uranus', size: 0.8, distance: 24, speed: 0.2, color: 0x4fd0e7 },
    { name: 'Neptune', size: 0.8, distance: 28, speed: 0.1, color: 0x4b70dd }
];

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 35);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    clock = new THREE.Clock();

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.4));
    const sunLight = new THREE.PointLight(0xffffff, 1);
    scene.add(sunLight);

    // Create sun
    const sunGeo = new THREE.SphereGeometry(2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
    sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Create planets
    planetData.forEach((data, i) => {
        const geo = new THREE.SphereGeometry(data.size, 32, 32);
        const mat = new THREE.MeshBasicMaterial({ color: data.color });
        const planet = new THREE.Mesh(geo, mat);
        planet.position.x = data.distance;
        planet.name = data.name;
        scene.add(planet);

        // Orbit line
        const orbitGeo = new THREE.RingGeometry(data.distance - 0.02, data.distance + 0.02, 64);
        const orbitMat = new THREE.MeshBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.6 });
        const orbit = new THREE.Mesh(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);

        planets.push({
            mesh: planet,
            data: data,
            speed: data.speed,
            angle: 0
        });

        // Saturn rings
        if (data.name === 'Saturn') {
            const ringGeo = new THREE.RingGeometry(1.2, 1.8, 32);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.7 });
            const rings = new THREE.Mesh(ringGeo, ringMat);
            rings.rotation.x = Math.PI / 2;
            planet.add(rings);
        }
    });

    // Stars
    const starsGeo = new THREE.BufferGeometry();
    const starVertices = [];
    for (let i = 0; i < 500; i++) {
        starVertices.push((Math.random() - 0.5) * 200);
        starVertices.push((Math.random() - 0.5) * 200);
        starVertices.push((Math.random() - 0.5) * 200);
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.0, sizeAttenuation:false });
    scene.add(new THREE.Points(starsGeo, starsMat));

    setupControls();
    animate();
}

// User interactions

function setupControls() {
    const container = document.getElementById('planetControls');
    
    planets.forEach((planet, i) => {
        const div = document.createElement('div');
        div.className = 'planet';
        div.innerHTML = `
            <label>${planet.data.name}</label>
            <input type="range" id="speed-${i}" min="0" max="5" step="0.1" value="${planet.data.speed}">
            <div class="speed-display">Speed: <span id="display-${i}">${planet.data.speed}</span>x</div>
        `;
        container.appendChild(div);
        
        document.getElementById(`speed-${i}`).addEventListener('input', (e) => {
            planet.speed = parseFloat(e.target.value);
            document.getElementById(`display-${i}`).textContent = planet.speed;
        });
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        planets.forEach((planet, i) => {
            planet.speed = planet.data.speed;
            planet.angle = 0;
            document.getElementById(`speed-${i}`).value = planet.speed;
            document.getElementById(`display-${i}`).textContent = planet.speed;
        });
    });

    // Mouse controls
    let dragging = false;
    let lastMouse = { x: 0, y: 0 };

    renderer.domElement.addEventListener('mousedown', (e) => {
        dragging = true;
        lastMouse = { x: e.clientX, y: e.clientY };
    });

    renderer.domElement.addEventListener('mousemove', (e) => {
        if (dragging) {
            const dx = e.clientX - lastMouse.x;
            const dy = e.clientY - lastMouse.y;
            const speed = 0.005;
            
            const distance = camera.position.length();
            const theta = Math.atan2(camera.position.z, camera.position.x) - dx * speed;
            const phi = Math.acos(camera.position.y / distance) - dy * speed;
            
            camera.position.x = distance * Math.sin(phi) * Math.cos(theta);
            camera.position.y = distance * Math.cos(phi);
            camera.position.z = distance * Math.sin(phi) * Math.sin(theta);
            camera.lookAt(0, 0, 0);
            
            lastMouse = { x: e.clientX, y: e.clientY };
        }

        // Tooltip
        const mouse = new THREE.Vector2();
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects([sun, ...planets.map(p => p.mesh)]);
        
        const tooltip = document.getElementById('tooltip');
        if (intersects.length > 0) {
            tooltip.innerHTML = intersects[0].object.name;
            tooltip.style.display = 'block';
            tooltip.style.left = e.clientX + 10 + 'px';
            tooltip.style.top = e.clientY - 10 + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    });

    renderer.domElement.addEventListener('mouseup', () => dragging = false);

    renderer.domElement.addEventListener('wheel', (e) => {
        const zoom = e.deltaY > 0 ? 1.1 : 0.9;
        camera.position.multiplyScalar(zoom);
        camera.lookAt(0, 0, 0);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        const delta = clock.getDelta();
        
        sun.rotation.y += delta * 0.5;
        
        planets.forEach(planet => {
            planet.angle += delta * planet.speed;
            planet.mesh.position.x = Math.cos(planet.angle) * planet.data.distance;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.data.distance;
            planet.mesh.rotation.y += delta * 2;
        });
    }

    renderer.render(scene, camera);
}

window.addEventListener('load', init);