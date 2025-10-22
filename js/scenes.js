// Base Scene Class
class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    enter() {} // Called when scene becomes active
    exit() {}  // Called when leaving scene
    update(deltaTime) {}
    render(ctx) {}
    handleClick(x, y) {}
}

// Main Menu Scene
class MainMenuScene extends Scene {
    constructor(engine) {
        super(engine);
        // Center play button
        const centerX = (this.engine?.width || 800) / 2 - 100;
        this.buttons = [
            { x: centerX, y: 200, width: 200, height: 60, text: 'PLAY', isPlayButton: true },
            { x: centerX, y: 300, width: 200, height: 50, text: 'Blackjack', scene: 'blackjack', hidden: true }
        ];
        this.showGames = false;
    }

    render(ctx) {
        // Draw background pattern
        const felt = this.engine.assets.getAsset('table_felt');
        const pattern = ctx.createPattern(felt, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);

        // Draw title with pixel art styling
        ctx.fillStyle = '#ffd700';
        ctx.font = '48px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PIXEL CASINO', this.engine.width / 2, 100);

        // Draw coins with chip icon
        this.engine.assets.drawAsset(ctx, 'chip_100', this.engine.width / 2 - 100, 130, 3);
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillText(`${this.engine.coins}`, this.engine.width / 2, 150);

        // Draw sample cards for decoration
        const cardScale = 4;
        this.engine.assets.drawAsset(ctx, 'card_♠_A', 100, 200, cardScale);
        this.engine.assets.drawAsset(ctx, 'card_♥_K', 150, 200, cardScale);
        this.engine.assets.drawAsset(ctx, 'card_♣_Q', 200, 200, cardScale);
        this.engine.assets.drawAsset(ctx, 'card_♦_J', 250, 200, cardScale);

        // Draw buttons
        this.buttons.forEach((button) => {
            if (!button.hidden || (this.showGames && !button.isPlayButton) || (!this.showGames && button.isPlayButton)) {
                // Button background
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(button.x, button.y, button.width, button.height);
                
                // Button border
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(button.x, button.y, button.width, button.height);
                
                // Button text
                ctx.fillStyle = '#000';
                ctx.font = button.isPlayButton ? '36px "Press Start 2P"' : '24px "Press Start 2P"';
                ctx.textAlign = 'center';
                ctx.fillText(button.text, button.x + button.width/2, button.y + (button.isPlayButton ? 45 : 35));
            }
        });

        // Draw "Select a game" text when showing game options
        if (this.showGames) {
            ctx.fillStyle = '#fff';
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('Select a game', this.engine.width / 2, 250);
        }
    }

    handleClick(x, y) {
        this.buttons.forEach(button => {
            if (x >= button.x && x <= button.x + button.width &&
                y >= button.y && y <= button.y + button.height) {
                if (button.isPlayButton && !this.showGames) {
                    // Show game selection buttons when PLAY is clicked
                    this.showGames = true;
                } else if (button.scene && this.showGames) {
                    // Navigate to the selected game
                    this.engine.setScene(button.scene);
                }
            }
        });
    }
}