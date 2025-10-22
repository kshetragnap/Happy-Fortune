class Deck {
    constructor() {
        this.reset();
    }

    reset() {
        const suits = ['♠', '♣', '♥', '♦'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.cards = [];
        
        for (let suit of suits) {
            for (let value of values) {
                this.cards.push({ suit, value });
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        if (this.cards.length === 0) {
            this.reset();
        }
        return this.cards.pop();
    }
}

class BlackjackHand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    getScore() {
        let score = 0;
        let aces = 0;

        for (let card of this.cards) {
            if (card.value === 'A') {
                aces += 1;
                score += 11;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces -= 1;
        }

        return score;
    }

    isBusted() {
        return this.getScore() > 21;
    }

    isBlackjack() {
        return this.cards.length === 2 && this.getScore() === 21;
    }

    clear() {
        this.cards = [];
    }
}

class BlackjackGame {
    constructor(engine) {
        this.engine = engine;
        this.deck = new Deck();
        this.playerHand = new BlackjackHand();
        this.dealerHand = new BlackjackHand();
        this.currentBet = 0;
        this.gameState = 'betting'; // betting, playing, dealerTurn, gameOver
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
        this.playerHand.clear();
        this.dealerHand.clear();
        
        // Initial deal
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());
        this.playerHand.addCard(this.deck.draw());
        this.dealerHand.addCard(this.deck.draw());

        this.gameState = 'playing';
        
        if (this.playerHand.isBlackjack()) {
            this.handleBlackjack();
        }
    }

    hit() {
        if (this.gameState !== 'playing') return;

        this.playerHand.addCard(this.deck.draw());
        
        if (this.playerHand.isBusted()) {
            this.endHand('Player busts!');
            return;
        }

        // If player reaches 21 exactly, automatically stand
        if (this.playerHand.getScore() === 21) {
            this.stand();
        }
    }

    stand() {
        if (this.gameState !== 'playing') return;
        
        this.gameState = 'dealerTurn';
        this.dealerPlay();
    }

    dealerPlay() {
        while (this.dealerHand.getScore() < 17) {
            this.dealerHand.addCard(this.deck.draw());
        }

        this.determineWinner();
    }

    handleBlackjack() {
        if (this.dealerHand.isBlackjack()) {
            this.endHand('Push - both have Blackjack!');
            this.engine.addCoins(this.currentBet);
        } else {
            this.endHand('Blackjack! Player wins!');
            this.engine.addCoins(this.currentBet * 2.5);
        }
    }

    determineWinner() {
        const playerScore = this.playerHand.getScore();
        const dealerScore = this.dealerHand.getScore();

        if (dealerScore > 21) {
            this.endHand('Dealer busts! Player wins!');
            this.engine.addCoins(this.currentBet * 2);
        } else if (playerScore > dealerScore) {
            this.endHand('Player wins!');
            this.engine.addCoins(this.currentBet * 2);
        } else if (dealerScore > playerScore) {
            this.endHand('Dealer wins!');
        } else {
            this.endHand('Push - it\'s a tie!');
            this.engine.addCoins(this.currentBet);
        }
    }

    endHand(message) {
        this.gameState = 'gameOver';
        this.message = message;
        // Reset for next round after a short delay
        setTimeout(() => {
            this.gameState = 'betting';
            this.message = 'Place your bet';
            this.playerHand.clear();
            this.dealerHand.clear();
            this.currentBet = 0;
        }, 2000);
    }

    canHit() {
        return this.gameState === 'playing' && !this.playerHand.isBusted() && this.playerHand.getScore() < 21;
    }

    canStand() {
        return this.gameState === 'playing';
    }

    canBet() {
        return this.gameState === 'betting';
    }

    reset() {
        this.gameState = 'betting';
        this.message = 'Place your bet';
        this.playerHand.clear();
        this.dealerHand.clear();
        this.currentBet = 0;
        this.deck = new Deck();
    }
}