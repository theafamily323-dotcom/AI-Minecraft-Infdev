const BLOCK_NAMES = {
    [BLOCKS.STONE]: 'Stone',
    [BLOCKS.DIRT]: 'Dirt',
    [BLOCKS.GRASS]: 'Grass',
    [BLOCKS.OAK_LOG]: 'Wood',
    [BLOCKS.GLASS]: 'Glass',
    [BLOCKS.SAND]: 'Sand'
};

class GameState {
    constructor() {
        this.currentScreen = 'home';
        this.isPaused = false;
        this.currentWorld = null;
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName + 'Screen').classList.add('active');
        this.currentScreen = screenName;
    }

    togglePause() {
        if (this.currentScreen === 'game') {
            this.isPaused = !this.isPaused;
            const pauseMenu = document.getElementById('pauseMenu');
            if (this.isPaused) {
                pauseMenu.classList.remove('hidden');
                document.exitPointerLock();
            } else {
                pauseMenu.classList.add('hidden');
                document.getElementById('gameContainer').requestPointerLock();
            }
        }
    }
}

const gameState = new GameState();

document.getElementById('newWorldBtn').addEventListener('click', () => {
    gameState.showScreen('worldCreation');
});

document.getElementById('loadWorldBtn').addEventListener('click', () => {
    alert('Load World feature coming soon!');
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    alert('Settings feature coming soon!');
});

document.getElementById('backBtn').addEventListener('click', () => {
    gameState.showScreen('home');
});

document.getElementById('createBtn').addEventListener('click', () => {
    const worldName = document.getElementById('worldName').value || 'New World';
    const worldSeed = document.getElementById('worldSeed').value || Math.random().toString();

    gameState.currentWorld = {
        name: worldName,
        seed: worldSeed
    };

    gameState.showScreen('game');
    startGame(worldSeed);
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    gameState.togglePause();
});

document.getElementById('homeBtn').addEventListener('click', () => {
    location.reload();
});
