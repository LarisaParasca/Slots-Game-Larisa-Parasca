import * as PIXI from 'pixi.js';
import { AssetLoader } from '../utils/AssetLoader';

const SYMBOL_TEXTURES = [
    'symbol1.png',
    'symbol2.png',
    'symbol3.png',
    'symbol4.png',
    'symbol5.png',
];

// Reel animation constants
const SPIN_SPEED = 50; // Pixels per frame at full speed
const SLOWDOWN_RATE = 0.95; // Multiplier applied each frame when slowing down
const MIN_SPEED_THRESHOLD = 0.5; // Speed threshold below which reel stops completely

/**
 * Represents a single reel in the slot machine with horizontal scrolling symbols
 */
export class Reel {
    public container: PIXI.Container;
    private symbols: PIXI.Sprite[];
    private symbolSize: number;
    private symbolCount: number;
    private speed: number = 0;
    private isSpinning: boolean = false;

    constructor(symbolCount: number, symbolSize: number) {
        this.container = new PIXI.Container();
        this.symbols = [];
        this.symbolSize = symbolSize;
        this.symbolCount = symbolCount;

        this.createSymbols();
    }

    private createSymbols(): void {
        // Create symbols for the reel, arranged horizontally
        for (let i = 0; i < this.symbolCount; i++) {
            const symbol = this.createRandomSymbol();
            symbol.x = i * this.symbolSize;
            this.symbols.push(symbol);
            this.container.addChild(symbol);
        }
    }

    private createRandomSymbol(): PIXI.Sprite {
        // Get a random symbol texture
        const randomIndex = Math.floor(Math.random() * SYMBOL_TEXTURES.length);
        const textureName = SYMBOL_TEXTURES[randomIndex];
        const texture = AssetLoader.getTexture(textureName);

        if (!texture) {
            throw new Error(`Texture "${textureName}" not found`);
        }

        // Create a sprite with the texture
        const sprite = new PIXI.Sprite(texture);
        sprite.width = this.symbolSize;
        sprite.height = this.symbolSize;

        return sprite;
    }

    public update(delta: number): void {
        if (!this.isSpinning && this.speed === 0) return;

        // Move symbols horizontally
        const movement = this.speed * delta;
        for (const symbol of this.symbols) {
            symbol.x -= movement;

            // Wrap symbols around when they move off the left edge
            if (symbol.x <= -this.symbolSize) {
                symbol.x += this.symbolCount * this.symbolSize;

                // Replace with random symbol when wrapping
                const randomIndex = Math.floor(Math.random() * SYMBOL_TEXTURES.length);
                const textureName = SYMBOL_TEXTURES[randomIndex];
                const texture = AssetLoader.getTexture(textureName);
                if (texture) {
                    symbol.texture = texture;
                }
            }
        }

        // If we're stopping, slow down the reel
        if (!this.isSpinning && this.speed > 0) {
            this.speed *= SLOWDOWN_RATE;

            // If speed is very low, stop completely and snap to grid
            if (this.speed < MIN_SPEED_THRESHOLD) {
                this.speed = 0;
                this.snapToGrid();
            }
        }
    }

    private snapToGrid(): void {
        // Snap symbols to horizontal grid positions
        for (let i = 0; i < this.symbols.length; i++) {
            const targetX = i * this.symbolSize;
            this.symbols[i].x = targetX;
        }
    }

    public startSpin(): void {
        this.isSpinning = true;
        this.speed = SPIN_SPEED;
    }

    public stopSpin(): void {
        this.isSpinning = false;
        // The reel will gradually slow down in the update method
    }
}
