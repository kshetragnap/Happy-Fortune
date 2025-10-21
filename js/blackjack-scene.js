class BlackjackScene extends Scene {
    constructor(engine) {
        super(engine);
        this.game = new BlackjackGame(engine);
        this.betOptions = [10, 25, 50, 100];
        this.selectedBet = 10;
    }

    enter() {
        if (!this.game) {
            this.game = new BlackjackGame(this.engine);
        } else {
            this.game.reset();
        }
    }

    handleClick(x, y) {
        // Betting controls (bottom of screen)
        if (y >= this.engine.height - 100) {
            if (this.game.canBet()) {
                // Bet amount selection
                this.betOptions.forEach((bet, index) => {
                    const chipX = 200 + (index * 80);
                    if (x >= chipX && x < chipX + 60 && y >= this.engine.height - 80) {
                        this.selectedBet = bet;
                    }
                });

                // Deal button
                if (x >= this.engine.width - 200 && x < this.engine.width - 100 &&
                    y >= this.engine.height - 80) {
                    this.game.placeBet(this.selectedBet);
                }
            }
        }
        // Game controls (right side of screen)
        else if (x >= this.engine.width - 150) {
            // Hit button
            if (y >= 200 && y < 260 && this.game.canHit()) {
                this.game.hit();
            }
            // Stand button
            else if (y >= 280 && y < 340 && this.game.canStand()) {
                this.game.stand();
            }
            // Back to menu button
            else if (y >= 360 && y < 420) {
                this.engine.setScene('menu');
            }
        }
    }

    render(ctx) {
        // Draw table background
        const felt = this.engine.assets.getAsset('table_felt');
        const pattern = ctx.createPattern(felt, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);

        // Draw coins
        ctx.fillStyle = '#ffd700';
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Coins: ${this.engine.coins}`, 20, 40);

        // Draw current bet if playing
        if (this.game.currentBet > 0) {
            ctx.fillText(`Bet: ${this.game.currentBet}`, 20, 80);
        }

        // Draw dealer's cards
        this.renderHand(ctx, this.game.dealerHand, 300, 150, this.game.gameState === 'playing');

        // Draw player's cards
        this.renderHand(ctx, this.game.playerHand, 300, 350, false);

        // Draw game controls
        if (this.game.gameState === 'playing') {
            this.drawButton(ctx, 'HIT', this.engine.width - 150, 200, this.game.canHit());
            this.drawButton(ctx, 'STAND', this.engine.width - 150, 280, this.game.canStand());
        }

        // Draw betting controls
        if (this.game.canBet()) {
            this.betOptions.forEach((bet, index) => {
                const chipX = 200 + (index * 80);
                const chipY = this.engine.height - 80;
                this.engine.assets.drawAsset(ctx, `chip_${bet}`, chipX, chipY, 4);
                if (bet === this.selectedBet) {
                    ctx.strokeStyle = '#ffd700';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(chipX - 2, chipY - 2, 52, 52);
                }
            });

            this.drawButton(ctx, 'DEAL', this.engine.width - 200, this.engine.height - 80, true);
        }

        // Draw game message
        if (this.game.message) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '32px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.game.message, this.engine.width / 2, this.engine.height / 2);
        }

        // Always show back button
        this.drawButton(ctx, 'MENU', this.engine.width - 150, 360, true);
    }

    renderHand(ctx, hand, x, y, hideFirst) {
        const cardSpacing = 30;
        hand.cards.forEach((card, index) => {
            if (hideFirst && index === 0) {
                this.engine.assets.drawAsset(ctx, 'card_back', x + (index * cardSpacing), y, 4);
            } else {
                this.engine.assets.drawAsset(ctx, `card_${card.suit}_${card.value}`, x + (index * cardSpacing), y, 4);
            }
        });

        // Draw score if not hiding cards
        if (!hideFirst && hand.cards.length > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`Score: ${hand.getScore()}`, x, y + 100);
        }
    }

    drawButton(ctx, text, x, y, active) {
        this.engine.assets.drawAsset(ctx, `button_${text.toLowerCase()}${active ? '' : '_inactive'}`, x, y, 3);
    }
}