class SlotScene extends Scene {
    constructor(engine) {
        super(engine);
        this.game = new SlotGame(engine);
        this.betOptions = [10, 25, 50, 100];
    }

    enter() {
        if (!this.game) this.game = new SlotGame(this.engine);
    }

    handleClick(x, y) {
        // Bet +/- buttons on left bottom area
        const plusX = 20;
        const plusY = this.engine.height - 120;
        const btnW = 32 * 3; // scaled width
        const btnH = 16 * 3;
        if (x >= plusX && x < plusX + btnW) {
            // plus
            if (y >= plusY && y < plusY + btnH) {
                this.engine.changeBet(this.engine.betStep);
                return;
            }
            // minus (below plus)
            if (y >= plusY + btnH + 8 && y < plusY + btnH * 2 + 8) {
                this.engine.changeBet(-this.engine.betStep);
                return;
            }
        }

        // Chip clicks: change bet step
        this.betOptions.forEach((bet, index) => {
            const chipX = 200 + (index * 80);
            const chipY = this.engine.height - 80;
            if (x >= chipX && x < chipX + 60 && y >= chipY && y < chipY + (16 * 4)) {
                if (this.engine.setBetStep) this.engine.setBetStep(bet);
                else this.engine.betStep = bet;
                return;
            }
        });

        // Spin/back buttons on right like Blackjack
        if (x >= this.engine.width - 200) {
            if (y >= 200 && y < 260) {
                this.game.spin();
            } else if (y >= 360 && y < 420) {
                this.engine.setScene('menu');
            }
        }
    }

    render(ctx) {
        const felt = this.engine.assets.getAsset('table_felt');
        const pattern = ctx.createPattern(felt, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);

        ctx.fillStyle = '#ffd700';
        ctx.font = '36px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SLOTS', this.engine.width / 2, 80);

    // Draw coins (top-left) similar to Blackjack
    ctx.fillStyle = '#ffd700';
    ctx.font = '24px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Coins: ${this.engine.coins}`, 20, 40);

        // Reels
        const symbols = this.game.getSymbols();
        const reelX = 140;
        const reelY = 160;
        const reelW = 120;
        const reelH = 120;
        for (let i = 0; i < 3; i++) {
            const rx = reelX + i * (reelW + 20);
            ctx.fillStyle = '#222';
            ctx.fillRect(rx, reelY, reelW, reelH);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 4;
            ctx.strokeRect(rx, reelY, reelW, reelH);

            ctx.fillStyle = '#fff';
            // Use a font that supports emoji glyphs and make it larger for clarity
            ctx.font = '48px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbols[i], rx + reelW / 2, reelY + reelH / 2);
        }

        // Draw spin/menu buttons
        this.engine.assets.drawAsset(ctx, `button_spin`, this.engine.width - 150, 200, 3);
        this.engine.assets.drawAsset(ctx, `button_menu`, this.engine.width - 150, 360, 3);

        // Draw chips (quick-select bet step), bet amount and +/- buttons
        this.betOptions.forEach((bet, index) => {
            const chipX = 200 + (index * 80);
            const chipY = this.engine.height - 80;
            this.engine.assets.drawAsset(ctx, `chip_${bet}`, chipX, chipY, 4);
            if (bet === this.engine.betStep) {
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 2;
                const chipAsset = this.engine.assets.getAsset(`chip_${bet}`);
                const w = Math.round((chipAsset ? chipAsset.width : 16) * 4);
                const h = Math.round((chipAsset ? chipAsset.height : 16) * 4);
                ctx.strokeRect(chipX - 2, chipY - 2, w + 4, h + 4);
            }
        });

        // Draw bet amount and +/- buttons
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`Bet: ${this.engine.betAmount}`, 20, this.engine.height - 140);

        // plus button
        this.engine.assets.drawAsset(ctx, `button_+`, 20, this.engine.height - 120, 3);
        // minus button
        this.engine.assets.drawAsset(ctx, `button_-`, 20, this.engine.height - 120 + (16 * 3) + 8, 3);

        // Message
        if (this.game.message) {
            ctx.fillStyle = '#ffd700';
            ctx.font = '20px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.game.message, this.engine.width / 2, this.engine.height - 80);
        }
    }
}
