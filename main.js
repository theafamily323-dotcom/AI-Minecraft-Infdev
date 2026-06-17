let renderer, world, player;

function startGame(seed) {
    const container = document.getElementById('gameContainer');
    container.innerHTML = '';

    // Three.js setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(50, 100, 50);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    // World setup
    world = new World(seed);
    world.scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    world.scene.add(ambientLight);

    // Player setup
    player = new Player(world);
    world.scene.add(player.camera);

    // Initial chunks
    world.updateChunksAroundPlayer(player.position.x, player.position.z);

    // Request pointer lock
    document.getElementById('gameContainer').addEventListener('click', () => {
        document.getElementById('gameContainer').requestPointerLock();
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start game loop
    animate();
}

function onWindowResize() {
    if (!player) return;
    
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (!gameState.isPaused) {
        player.update();
    }

    renderer.render(world.scene, player.camera);
}

// Handle visibility change (pause when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState.currentScreen === 'game') {
        gameState.togglePause();
    }
});

// Initialize with home screen
gameState.showScreen('home');
