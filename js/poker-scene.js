class PokerScene extends Scene {
    constructor(engine) {
        super(engine);
        this.game = new PokerGame(engine);
        this.betOptions = [1, 5, 10, 25];
        this.selectedBet = 1;
        
        // Card positions
        this.cardPositions = Array(5).fill(null).map((_, i) => ({
            x: 200 + (i * 100),
            y: 250,
            width: 64,
            height: 80
        }));
    }

    enter() {
        this.game = new PokerGame(this.engine);
    }

    handleClick(x, y) {
        // Check card clicks for hold
        if (this.game.gameState === 'firstDraw') {
            this.cardPositions.forEach((pos, index) => {
                if (x >= pos.x && x < pos.x + pos.width &&
                    y >= pos.y && y < pos.y + pos.height) {
                    this.game.toggleHold(index);
                }
            });
        }

        // Check betting controls
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

        // Check game controls
        if (x >= this.engine.width - 150) {
            // Draw button
            if (y >= 200 && y < 260 && this.game.canDraw()) {
                this.game.draw();
            }
            // Back to menu button
            else if (y >= 280 && y < 340) {
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

        // Draw coins and bet
        ctx.fillStyle = '#ffd700';
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Coins: ${this.engine.coins}`, 20, 40);
        if (this.game.currentBet > 0) {
            ctx.fillText(`Bet: ${this.game.currentBet}`, 20, 80);
        }

        // Draw cards
        this.game.hand.cards.forEach((card, index) => {
            const pos = this.cardPositions[index];
            this.engine.assets.drawAsset(ctx, `card_${card.suit}_${card.value}`, pos.x, pos.y, 4);
            
            // Draw hold indicator
            if (this.game.hand.held[index]) {
                ctx.fillStyle = '#ffd700';
                ctx.font = '20px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('HOLD', pos.x + 32, pos.y + 100);
            }
        });

        // Draw game controls
        if (this.game.canDraw()) {
            this.drawButton(ctx, 'DRAW', this.engine.width - 150, 200, true);
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
            ctx.font = '24px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.game.message, this.engine.width / 2, 150);
        }

        // Always show menu button
        this.drawButton(ctx, 'MENU', this.engine.width - 150, 280, true);

        // Draw paytable
        this.drawPaytable(ctx);
    }

    drawButton(ctx, text, x, y, active) {
        this.engine.assets.drawAsset(ctx, `button_${text.toLowerCase()}${active ? '' : '_inactive'}`, x, y, 3);
    }

    drawPaytable(ctx) {
        const hands = [
            { name: 'Royal Flush', multiplier: 250 },
            { name: 'Straight Flush', multiplier: 50 },
            { name: 'Four of a Kind', multiplier: 25 },
            { name: 'Full House', multiplier: 9 },
            { name: 'Flush', multiplier: 6 },
            { name: 'Straight', multiplier: 4 },
            { name: 'Three of a Kind', multiplier: 3 },
            { name: 'Two Pair', multiplier: 2 },
            { name: 'Jacks or Better', multiplier: 1 }
        ];

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(20, 100, 180, hands.length * 25 + 10);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        
        hands.forEach((hand, index) => {
            const y = 120 + (index * 25);
            ctx.fillText(`${hand.name}: ${hand.multiplier}x`, 30, y);
        });
    }
}