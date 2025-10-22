// Pixel Art Assets Manager
class PixelArtManager {
    constructor(ctx) {
        this.ctx = ctx;
        this.assets = new Map();
        this.colors = {
            cardRed: '#ff4444',
            cardBlack: '#333333',
            gold: '#ffd700',
            goldShadow: '#c89f00',
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
        
        // Draw value and suit using a small pixel font/glyphs for crisp scaling
        const glyphs = {
            '0': [0b111,0b101,0b101,0b101,0b111],
            '1': [0b010,0b110,0b010,0b010,0b111],
            '2': [0b111,0b001,0b111,0b100,0b111],
            '3': [0b111,0b001,0b111,0b001,0b111],
            '4': [0b101,0b101,0b111,0b001,0b001],
            '5': [0b111,0b100,0b111,0b001,0b111],
            '6': [0b111,0b100,0b111,0b101,0b111],
            '7': [0b111,0b001,0b010,0b100,0b100],
            '8': [0b111,0b101,0b111,0b101,0b111],
            '9': [0b111,0b101,0b111,0b001,0b111],
            'A': [0b010,0b101,0b111,0b101,0b101],
            'J': [0b111,0b010,0b010,0b101,0b111],
            'Q': [0b111,0b101,0b101,0b111,0b001],
            'K': [0b101,0b110,0b100,0b110,0b101]
        };

        // 5x5 pixel suit glyphs (more detailed)
        const suitGlyphs = {
            '♥': [0b10101,0b11111,0b11111,0b01110,0b00100],
            '♦': [0b00100,0b01110,0b11111,0b01110,0b00100],
            '♠': [0b00100,0b01110,0b11111,0b10101,0b00100],
            '♣': [0b01010,0b11111,0b11111,0b01110,0b00100]
        };

        // Helper to draw a glyph (3x5) at pixel coords
        const drawGlyph = (ch, ox, oy, fillColor) => {
            const pattern = glyphs[ch];
            if (!pattern) return;
            ctx.fillStyle = fillColor;
            for (let row = 0; row < pattern.length; row++) {
                const bits = pattern[row];
                for (let col = 0; col < 3; col++) {
                    if ((bits >> (2 - col)) & 1) ctx.fillRect(ox + col, oy + row, 1, 1);
                }
            }
        };

        // Draw top-left value
        if (!isBack && value) {
            const valStr = String(value);
            // if '10', draw '1' and '0' side-by-side
            const startX = 2;
            const startY = 3;
            if (valStr === '10') {
                drawGlyph('1', startX, startY, color);
                drawGlyph('0', startX + 4, startY, color);
            } else {
                drawGlyph(valStr, startX, startY, color);
            }

            // Draw suit glyph below value
            const suitPattern = suitGlyphs[suit];
            if (suitPattern) {
                ctx.fillStyle = color;
                // draw 5-wide glyph centered under the value
                const ox = 3; // left offset to center 5px glyph in 16px card
                const oy = 9;
                for (let row = 0; row < suitPattern.length; row++) {
                    const bits = suitPattern[row];
                    for (let col = 0; col < 5; col++) {
                        if ((bits >> (4 - col)) & 1) ctx.fillRect(ox + col, oy + row, 1, 1);
                    }
                }
            }
        }

        return canvas;
    }

    // Create a chip (16x16 pixels). If value is null/undefined, no label is drawn.
    createChip(value) {
        const size = 16;
        const canvas = this.createPixelCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Choose color based on value (low: bronze, mid: silver, high: gold)
        let color;
        if (value == null) {
            // decorative chip uses gold
            color = this.colors.gold;
        } else if (value >= 100) {
            color = this.colors.gold;
        } else if (value >= 50) {
            color = this.colors.silver;
        } else {
            color = this.colors.bronze;
        }

        // Draw a pixelated circle by filling 1x1 rects for each pixel whose
        // distance from center is <= radius. This avoids anti-aliased arcs so
        // scaled-up pixel art remains sharp.
    const cx = (size - 1) / 2;
    const cy = (size - 1) / 2;
    const radius = 6; // in pixels

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= radius + 0.0) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

    // Inner shadow/detail (smaller pixel circle) - choose shadow color per chip type
    let innerShadowColor = this.colors.shadow;
    if (color === this.colors.gold) innerShadowColor = this.colors.goldShadow;
    else if (color === this.colors.silver) innerShadowColor = '#9b9b9b';
    else if (color === this.colors.bronze) innerShadowColor = '#8b5a2b';
    ctx.fillStyle = innerShadowColor;
    const innerRadius = 4;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dx = x - cx - 0.2; // slight offset for highlight/shadow
                const dy = y - cy - 0.2;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist <= innerRadius) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

    // Draw chip value using a tiny 3x5 pixel font so numbers remain crisp
    // If value is null/undefined, skip drawing the label (decorative chip)
    if (value != null) {
        const digitsMap = {
            '0': [0b111,0b101,0b101,0b101,0b111],
            '1': [0b010,0b110,0b010,0b010,0b111],
            '2': [0b111,0b001,0b111,0b100,0b111],
            '3': [0b111,0b001,0b111,0b001,0b111],
            '4': [0b101,0b101,0b111,0b001,0b001],
            '5': [0b111,0b100,0b111,0b001,0b111],
            '6': [0b111,0b100,0b111,0b101,0b111],
            '7': [0b111,0b001,0b010,0b100,0b100],
            '8': [0b111,0b101,0b111,0b101,0b111],
            '9': [0b111,0b101,0b111,0b001,0b111]
        };

    const s = String(value);
    const digitW = 3;
    const digitH = 5;
    const spacing = 1;
        const totalW = s.length * digitW + Math.max(0, s.length - 1) * spacing;
        // top-left starting coordinates for number block
        const startX = Math.round(cx - totalW / 2);
        const startY = Math.round(cy - Math.floor(digitH / 2));

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            const pattern = digitsMap[ch] || digitsMap['0'];
            const offsetX = startX + i * (digitW + spacing);
            for (let row = 0; row < digitH; row++) {
                const bits = pattern[row];
                for (let col = 0; col < digitW; col++) {
                    if ((bits >> (digitW - 1 - col)) & 1) {
                        ctx.fillRect(offsetX + col, startY + row, 1, 1);
                    }
                }
            }
        }
        }

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
        // Decorative chip (no number) used in menus
        this.storeAsset('chip_decor', this.createChip(null));

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
