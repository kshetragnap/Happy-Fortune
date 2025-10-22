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

    // Initialize canvas with pixel-perfect high-DPI settings
    this.canvas = document.createElement('canvas');
    // Set internal buffer at pixelRatio times logical size for crisp upscaling
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);
    // Keep CSS size at logical dimensions so layout remains unchanged
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    // Prefer pixelated rendering in CSS
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.imageRendering = '-moz-crisp-edges';
    this.canvas.style.imageRendering = 'crisp-edges';
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Disable anti-aliasing
    // Scale the drawing context so coordinates use logical pixel units (width x height)
    this.ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
        
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
            // Map pointer to logical canvas coordinates (unaffected by pixelRatio)
            const x = (e.clientX - rect.left) * (this.width / rect.width);
            const y = (e.clientY - rect.top) * (this.height / rect.height);

            if (this.currentScene) {
                this.currentScene.handleClick(x, y);
            }
        });

        // Keyboard shortcut: press M to add 1000 coins (cheat)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'm' || e.key === 'M') {
                this.addCoins(1000);
                // show a temporary message on the current scene if possible
                if (this.currentScene) {
                    this.currentScene.message = '+1000 coins!';
                    setTimeout(() => {
                        if (this.currentScene && this.currentScene.message === '+1000 coins!') {
                            this.currentScene.message = '';
                        }
                    }, 1500);
                }
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
