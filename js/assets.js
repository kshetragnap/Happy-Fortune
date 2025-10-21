// Pixel Art Assets Manager
class PixelArtManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.assets = new Map();
        this.colors = {
            cardRed: '#ff4444',
            cardBlack: '#333333',
            gold: '#ffd700',
            silver: '#c0c0c0',
            bronze: '#cd7f32',
            green: '#2ecc71',
            white: '#ffffff',
            shadow: 'rgba(0,0,0,0.5)'
        };
    }

    createPixelCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    // Create a playing card (16x20 pixels)
    createCard(suit, value, isBack = false) {
        const canvas = this.createPixelCanvas(16, 20);
        const ctx = canvas.getContext('2d');
        
        // Card background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 16, 20);
        
        if (isBack) {
            // Card back pattern
            ctx.fillStyle = '#2980b9';
            for (let y = 0; y < 20; y += 2) {
                for (let x = 0; x < 16; x += 2) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
            return canvas;
        }

        // Card border
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(0, 0, 16, 20);

        // Suit color
        const color = (suit === '♥' || suit === '♦') ? this.colors.cardRed : this.colors.cardBlack;
        
        // Draw value
        ctx.fillStyle = color;
        ctx.font = '6px Arial';
        ctx.fillText(value, 2, 7);
        
        // Draw suit
        ctx.font = '8px Arial';
        ctx.fillText(suit, 4, 15);

        return canvas;
    }

    // Create a chip (12x12 pixels)
    createChip(value) {
        const canvas = this.createPixelCanvas(12, 12);
        const ctx = canvas.getContext('2d');
        
        // Choose color based on value
        let color;
        if (value >= 100) color = this.colors.gold;
        else if (value >= 50) color = this.colors.silver;
        else color = this.colors.bronze;

        // Main circle
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(6, 6, 5, 0, Math.PI * 2);
        ctx.fill();

        // Inner detail
        ctx.fillStyle = this.colors.shadow;
        ctx.beginPath();
        ctx.arc(6, 6, 3, 0, Math.PI * 2);
        ctx.fill();

        // Value
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, 6, 8);

        return canvas;
    }

    // Create a button (32x16 pixels)
    createButton(text, isActive = true) {
        const canvas = this.createPixelCanvas(32, 16);
        const ctx = canvas.getContext('2d');
        
        // Button background
        ctx.fillStyle = isActive ? this.colors.gold : this.colors.shadow;
        ctx.fillRect(0, 0, 32, 16);
        
        // Button text
        ctx.fillStyle = '#000000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, 16, 11);

        return canvas;
    }

    // Create table felt background (64x64 pixels)
    createTableFelt() {
        const canvas = this.createPixelCanvas(64, 64);
        const ctx = canvas.getContext('2d');
        
        // Base green
        ctx.fillStyle = this.colors.green;
        ctx.fillRect(0, 0, 64, 64);
        
        // Add texture pattern
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        for (let y = 0; y < 64; y += 2) {
            for (let x = 0; x < 64; x += 2) {
                if ((x + y) % 4 === 0) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        return canvas;
    }

    // Store an asset
    storeAsset(name, canvas) {
        this.assets.set(name, canvas);
    }

    // Get an asset
    getAsset(name) {
        return this.assets.get(name);
    }

    // Initialize all assets
    initializeAssets() {
        // Create and store card assets
        const suits = ['♠', '♣', '♥', '♦'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        suits.forEach(suit => {
            values.forEach(value => {
                const cardName = `card_${suit}_${value}`;
                this.storeAsset(cardName, this.createCard(suit, value));
            });
        });
        
        // Store card back
        this.storeAsset('card_back', this.createCard(null, null, true));

        // Create and store chip assets
        [1, 5, 10, 25, 50, 100, 500].forEach(value => {
            this.storeAsset(`chip_${value}`, this.createChip(value));
        });

        // Create and store button assets
        ['Bet', 'Hit', 'Stand', 'Deal'].forEach(text => {
            this.storeAsset(`button_${text.toLowerCase()}`, this.createButton(text));
            this.storeAsset(`button_${text.toLowerCase()}_inactive`, this.createButton(text, false));
        });

        // Store table felt
        this.storeAsset('table_felt', this.createTableFelt());
    }

    // Draw an asset at specified position with optional scaling
    drawAsset(ctx, assetName, x, y, scale = 1) {
        const asset = this.getAsset(assetName);
        if (asset) {
            // Save current context state
            ctx.save();
            
            // Disable image smoothing for sharp pixels
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;
            
            // Round position to avoid sub-pixel rendering
            const roundX = Math.round(x);
            const roundY = Math.round(y);
            
            // Calculate scaled dimensions
            const width = Math.round(asset.width * scale);
            const height = Math.round(asset.height * scale);
            
            // Draw the asset
            ctx.drawImage(asset, roundX, roundY, width, height);
            
            // Restore context state
            ctx.restore();
        }
    }
}
