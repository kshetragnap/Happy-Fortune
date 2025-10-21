// Casino Game Engine
class GameEngine {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;
        this.pixelRatio = 2; // For sharp pixel art
        this.scenes = new Map();
        this.currentScene = null;
        this.coins = 1000; // Starting coins
        
        // Initialize pixel art assets
        this.assets = null;

        // Initialize canvas with pixel-perfect settings
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.imageRendering = 'pixelated';
        this.canvas.style.imageRendering = '-moz-crisp-edges';
        this.canvas.style.imageRendering = 'crisp-edges';
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Disable anti-aliasing
        
        // Initialize asset manager
        this.assets = new PixelArtManager(this.ctx);
        this.assets.initializeAssets();
        
        // Load saved coins
        this.loadCoins();
        
        // Setup input handling
        this.setupInput();
    }

    setupInput() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            if (this.currentScene) {
                this.currentScene.handleClick(x, y);
            }
        });
    }

    addScene(name, scene) {
        this.scenes.set(name, scene);
    }

    setScene(name) {
        if (this.scenes.has(name)) {
            this.currentScene = this.scenes.get(name);
            this.currentScene.enter();
        }
    }

    // Coin management
    loadCoins() {
        const savedCoins = localStorage.getItem('casinoCoins');
        if (savedCoins) {
            this.coins = parseInt(savedCoins);
        }
    }

    saveCoins() {
        localStorage.setItem('casinoCoins', this.coins.toString());
    }

    addCoins(amount) {
        this.coins += amount;
        this.saveCoins();
    }

    removeCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            this.saveCoins();
            return true;
        }
        return false;
    }

    update(deltaTime) {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
    }

    render() {
        if (this.currentScene) {
            this.currentScene.render(this.ctx);
        }
    }

    start() {
        let lastTime = 0;
        const gameLoop = (timestamp) => {
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            this.update(deltaTime);
            this.render();

            requestAnimationFrame(gameLoop);
        };

        requestAnimationFrame(gameLoop);
    }
}
