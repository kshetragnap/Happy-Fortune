// Minimal Slot machine game logic
class SlotGame {
    constructor(engine) {
        this.engine = engine;
        // Define symbols with weights (higher weight => more common) and payouts for 3-of-a-kind
        // We make the jackpot (7) very rare and common symbols more frequent to reduce win rate
        this.symbols = [
            { sym: '🍒', weight: 30, threePayout: 5 },   // common
            { sym: '🍋', weight: 25, threePayout: 3 },   // common
            { sym: '🔔', weight: 15, threePayout: 10 },  // uncommon
            { sym: '⭐', weight: 10, threePayout: 4 },   // uncommon
            { sym: '💎', weight: 6, threePayout: 20 },   // rare
            { sym: '7️⃣', weight: 2, threePayout: 50 }   // very rare jackpot
        ];

        // Precompute cumulative weights for fast selection
        this.cumulativeWeights = [];
        let total = 0;
        for (let i = 0; i < this.symbols.length; i++) {
            total += this.symbols[i].weight;
            this.cumulativeWeights.push(total);
        }
        this.totalWeight = total;

        this.reels = [0, 0, 0];
        this.spinning = false;
        this.message = '';
    }

    canSpin() {
        return !this.spinning && this.engine.coins >= this.engine.betAmount;
    }

    spin() {
        if (!this.canSpin()) {
            this.message = 'Not enough coins';
            setTimeout(() => { this.message = ''; }, 1200);
            return;
        }

        // Deduct bet
        this.engine.removeCoins(this.engine.betAmount);
        this.spinning = true;
        this.message = 'Spinning...';

        setTimeout(() => {
            for (let i = 0; i < 3; i++) this.reels[i] = this.weightedRandomIndex();
            this.spinning = false;
            const payout = this.evaluatePayout();
            if (payout > 0) {
                this.engine.addCoins(payout);
                this.message = `Win ${payout}!`;
            } else {
                this.message = 'No win';
            }
            setTimeout(() => { this.message = ''; }, 1400);
        }, 700);
    }

    evaluatePayout() {
        const [a, b, c] = this.reels;
        const bet = this.engine.betAmount;
        // Only pay for three-of-a-kind; pairs do not pay to make wins rarer
        if (a === b && b === c) {
            const symObj = this.symbols[a];
            const multiplier = (symObj && symObj.threePayout) ? symObj.threePayout : 5;
            return bet * multiplier;
        }
        return 0;
    }

    // Select an index based on the configured symbol weights
    weightedRandomIndex() {
        const r = Math.random() * this.totalWeight;
        for (let i = 0; i < this.cumulativeWeights.length; i++) {
            if (r < this.cumulativeWeights[i]) return i;
        }
        return this.cumulativeWeights.length - 1;
    }

    getSymbols() {
        return this.reels.map(i => (this.symbols[i] ? this.symbols[i].sym : '--'));
    }
}
