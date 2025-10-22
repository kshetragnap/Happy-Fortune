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
            { x: centerX, y: 300, width: 200, height: 50, text: 'Blackjack', scene: 'blackjack', hidden: true },
            { x: centerX, y: 400, width: 200, height: 50, text: 'Slots', scene: 'slots', hidden: true }
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

    // Draw coins with decorative chip icon (no numeric label) and align text next to it
    const chipAsset = this.engine.assets.getAsset('chip_decor');
    const chipScale = 3;
    const chipW = Math.round((chipAsset ? chipAsset.width : 16) * chipScale);
    const chipH = Math.round((chipAsset ? chipAsset.height : 16) * chipScale);
    // Prepare font for measuring
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const coinText = String(this.engine.coins);
    const textWidth = ctx.measureText ? ctx.measureText(coinText).width : 0;

    const centerX = this.engine.width / 2;
    const combinedWidth = chipW + 8 + textWidth; // 8px gap between chip and number

    const chipX = Math.round(centerX - combinedWidth / 2);
    const chipY = 130;
    // Draw chip
    this.engine.assets.drawAsset(ctx, 'chip_decor', chipX, chipY, chipScale);

    // Draw coin count to the right of the chip, vertically centered with the chip
    const textX = chipX + chipW + 8;
    const textY = Math.round(chipY + chipH / 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(coinText, textX, textY);

        // Draw buttons
        this.buttons.forEach((button) => {
            // Show PLAY only when not showing game options; show game buttons only when showGames=true
            const shouldRender = button.isPlayButton ? !this.showGames : this.showGames || !button.hidden;
            if (shouldRender) {
                // Button background
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(button.x, button.y, button.width, button.height);
                
                // Button border
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(button.x, button.y, button.width, button.height);
                
                // Button text (horizontally and vertically centered)
                ctx.fillStyle = '#000';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (button.isPlayButton) {
                    ctx.font = '36px "Press Start 2P"';
                } else {
                    // Start with preferred font size and reduce until it fits the button
                    let fontSize = 24;
                    const minFont = 12;
                    while (fontSize >= minFont) {
                        ctx.font = `${fontSize}px "Press Start 2P"`;
                        const measured = ctx.measureText(button.text).width;
                        if (measured <= button.width - 12) break; // leave some padding
                        fontSize -= 2;
                    }
                }

                const textY = button.y + button.height / 2;
                ctx.fillText(button.text, button.x + button.width / 2, textY);
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