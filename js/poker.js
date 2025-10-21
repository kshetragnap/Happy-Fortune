class PokerHand {
    constructor() {
        this.cards = [];
        this.held = new Array(5).fill(false);
    }

    addCard(card) {
        if (this.cards.length < 5) {
            this.cards.push(card);
        }
    }

    toggleHold(index) {
        if (index >= 0 && index < this.cards.length) {
            this.held[index] = !this.held[index];
        }
    }

    clear() {
        this.cards = [];
        this.held = new Array(5).fill(false);
    }

    // Get the poker hand rank
    evaluate() {
        if (this.cards.length !== 5) return { rank: 0, name: 'Invalid Hand' };

        const values = this.cards.map(card => {
            if (card.value === 'A') return 14;
            if (card.value === 'K') return 13;
            if (card.value === 'Q') return 12;
            if (card.value === 'J') return 11;
            return parseInt(card.value);
        }).sort((a, b) => b - a);

        const suits = this.cards.map(card => card.suit);
        const isFlush = suits.every(suit => suit === suits[0]);
        const isStraight = values.every((val, i) => i === 0 || val === values[i-1] - 1);

        // Count card frequencies
        const valueCounts = new Map();
        values.forEach(value => {
            valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
        });
        const frequencies = Array.from(valueCounts.values()).sort((a, b) => b - a);

        // Royal Flush
        if (isFlush && isStraight && values[0] === 14) {
            return { rank: 10, name: 'Royal Flush', multiplier: 250 };
        }
        // Straight Flush
        if (isFlush && isStraight) {
            return { rank: 9, name: 'Straight Flush', multiplier: 50 };
        }
        // Four of a Kind
        if (frequencies[0] === 4) {
            return { rank: 8, name: 'Four of a Kind', multiplier: 25 };
        }
        // Full House
        if (frequencies[0] === 3 && frequencies[1] === 2) {
            return { rank: 7, name: 'Full House', multiplier: 9 };
        }
        // Flush
        if (isFlush) {
            return { rank: 6, name: 'Flush', multiplier: 6 };
        }
        // Straight
        if (isStraight) {
            return { rank: 5, name: 'Straight', multiplier: 4 };
        }
        // Three of a Kind
        if (frequencies[0] === 3) {
            return { rank: 4, name: 'Three of a Kind', multiplier: 3 };
        }
        // Two Pair
        if (frequencies[0] === 2 && frequencies[1] === 2) {
            return { rank: 3, name: 'Two Pair', multiplier: 2 };
        }
        // Jacks or Better
        if (frequencies[0] === 2 && Array.from(valueCounts.keys()).some(v => v >= 11)) {
            return { rank: 2, name: 'Jacks or Better', multiplier: 1 };
        }
        // Nothing
        return { rank: 0, name: 'No Win', multiplier: 0 };
    }
}

class PokerGame {
    constructor(engine) {
        this.engine = engine;
        this.deck = new Deck();
        this.hand = new PokerHand();
        this.currentBet = 0;
        this.gameState = 'betting'; // betting, firstDraw, holding, complete
        this.message = '';
    }

    placeBet(amount) {
        if (this.gameState !== 'betting') return false;
        if (amount > this.engine.coins) return false;

        this.currentBet = amount;
        this.engine.removeCoins(amount);
        this.startNewHand();
        return true;
    }

    startNewHand() {
        this.hand.clear();
        this.deck = new Deck();
        
        // Deal 5 cards
        for (let i = 0; i < 5; i++) {
            this.hand.addCard(this.deck.draw());
        }

        this.gameState = 'firstDraw';
        this.message = 'Select cards to hold';
    }

    toggleHold(index) {
        if (this.gameState === 'firstDraw') {
            this.hand.toggleHold(index);
        }
    }

    draw() {
        if (this.gameState !== 'firstDraw') return;

        // Replace non-held cards
        for (let i = 0; i < this.hand.cards.length; i++) {
            if (!this.hand.held[i]) {
                this.hand.cards[i] = this.deck.draw();
            }
        }

        this.gameState = 'complete';
        this.evaluateWin();
    }

    evaluateWin() {
        const result = this.hand.evaluate();
        if (result.multiplier > 0) {
            const winnings = this.currentBet * result.multiplier;
            this.engine.addCoins(winnings);
            this.message = `${result.name}! Won ${winnings} coins!`;
        } else {
            this.message = 'No win. Try again!';
        }
    }

    canDraw() {
        return this.gameState === 'firstDraw';
    }

    canBet() {
        return this.gameState === 'betting' || this.gameState === 'complete';
    }
}