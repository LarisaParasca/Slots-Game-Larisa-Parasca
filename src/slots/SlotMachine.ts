import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { sound } from '../utils/sound';
import { AssetLoader } from '../utils/AssetLoader';
import { Spine } from 'pixi-spine';

// Game configuration constants
const REEL_COUNT = 4;
const SYMBOLS_PER_REEL = 6;
const SYMBOL_SIZE = 150;
const REEL_HEIGHT = SYMBOL_SIZE;
const REEL_SPACING = 10;

// Animation timing constants (in milliseconds)
const REEL_START_DELAY = 200; // Delay between each reel starting
const MIN_SPIN_DURATION = 500; // Minimum spin duration before stopping
const REEL_STOP_DELAY = 400; // Delay between each reel stopping
const FINAL_STOP_DELAY = 500; // Delay after last reel stops before checking win
const WIN_ANIMATION_DURATION = 3000; // Duration to show win animation

export class SlotMachine {
    public container: PIXI.Container;
    private reels: Reel[];
    private app: PIXI.Application;
    private isSpinning: boolean = false;
    private spinButton: PIXI.Sprite | null = null;
    private frameSpine: Spine | null = null;
    private winAnimation: Spine | null = null;
    private spinTimeouts: NodeJS.Timeout[] = []; // Track timeouts for cleanup

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.reels = [];

        // Center the slot machine
        this.container.x = this.app.screen.width / 2 - ((SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2);
        this.container.y = this.app.screen.height / 2 - ((REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2);

        this.createBackground();

        this.createReels();

        this.initSpineAnimations();
    }

    private createBackground(): void {
        try {
            const background = new PIXI.Graphics();
            background.beginFill(0x000000, 0.5);
            background.drawRect(
                -20,
                -20,
                SYMBOL_SIZE * SYMBOLS_PER_REEL + 40, // Width now based on symbols per reel
                REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40 // Height based on reel count
            );
            background.endFill();
            this.container.addChild(background);
        } catch (error) {
            console.error('Error creating background:', error);
        }
    }

    private createReels(): void {
        // Create each reel
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(SYMBOLS_PER_REEL, SYMBOL_SIZE);
            reel.container.y = i * (REEL_HEIGHT + REEL_SPACING);
            this.container.addChild(reel.container);
            this.reels.push(reel);
        }
    }

    public update(delta: number): void {
        // Update each reel
        for (const reel of this.reels) {
            reel.update(delta);
        }
    }

    public spin(): void {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.clearTimeouts(); // Clear any existing timeouts

        // Play spin sound
        sound.play('Reel spin');

        // Disable spin button
        this.disableSpinButton();

        // Start each reel with a staggered delay
        for (let i = 0; i < this.reels.length; i++) {
            const timeout = setTimeout(() => {
                this.reels[i].startSpin();
            }, i * REEL_START_DELAY);
            this.spinTimeouts.push(timeout);
        }

        // Stop all reels after a delay
        const stopTimeout = setTimeout(() => {
            this.stopSpin();
        }, MIN_SPIN_DURATION + (this.reels.length - 1) * REEL_START_DELAY);
        this.spinTimeouts.push(stopTimeout);
    }

    private stopSpin(): void {
        for (let i = 0; i < this.reels.length; i++) {
            const timeout = setTimeout(() => {
                this.reels[i].stopSpin();
                
                // If this is the last reel, check for wins and enable spin button
                if (i === this.reels.length - 1) {
                    const finalTimeout = setTimeout(() => {
                        this.checkWin();
                        this.isSpinning = false;
                        sound.stop('Reel spin');
                        this.enableSpinButton();
                    }, FINAL_STOP_DELAY);
                    this.spinTimeouts.push(finalTimeout);
                }
            }, i * REEL_STOP_DELAY);
            this.spinTimeouts.push(timeout);
        }
    }

    /**
     * Checks for a win condition and triggers win effects if applicable
     * Currently uses a simple random win check for demonstration
     */
    private checkWin(): void {
        const WIN_PROBABILITY = 0.3; // 30% chance of winning
        const randomWin = Math.random() < WIN_PROBABILITY;

        if (randomWin) {
            sound.play('win');
            console.log('Winner!');

            if (this.winAnimation) {
                // Play the win animation found in "big-boom-h" spine
                this.winAnimation.visible = true;
                this.winAnimation.state.setAnimation(0, 'start', false);
                
                // Hide animation after duration
                const winTimeout = setTimeout(() => {
                    if (this.winAnimation) {
                        this.winAnimation.visible = false;
                    }
                }, WIN_ANIMATION_DURATION);
                this.spinTimeouts.push(winTimeout);
            }
        }
    }

    public setSpinButton(button: PIXI.Sprite): void {
        this.spinButton = button;
    }

    /**
     * Disables the spin button visually and interactively
     */
    private disableSpinButton(): void {
        if (this.spinButton) {
            const texture = AssetLoader.getTexture('button_spin_disabled.png');
            if (texture) {
                this.spinButton.texture = texture;
            }
            this.spinButton.interactive = false;
        }
    }

    /**
     * Enables the spin button visually and interactively
     */
     private enableSpinButton(): void {
        if (this.spinButton) {
            const texture = AssetLoader.getTexture('button_spin.png');
            if (texture) {
                this.spinButton.texture = texture;
            }
            this.spinButton.interactive = true;
        }
    }

    /**
     * Clears all pending timeouts to prevent memory leaks
     */
    private clearTimeouts(): void {
        this.spinTimeouts.forEach(timeout => clearTimeout(timeout));
        this.spinTimeouts = [];
    }

    /**
     * Cleanup method to be called when destroying the slot machine
     */
    public destroy(): void {
        this.clearTimeouts();
        sound.stop('Reel spin');
        
        // Clean up reels
        this.reels.forEach(reel => {
            if (reel.container && reel.container.parent) {
                reel.container.parent.removeChild(reel.container);
            }
        });
        this.reels = [];
    }

    private initSpineAnimations(): void {
        try {
            const frameSpineData = AssetLoader.getSpine('base-feature-frame.json');
            if (frameSpineData) {
                this.frameSpine = new Spine(frameSpineData.spineData);

                this.frameSpine.y = (REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1)) / 2;
                this.frameSpine.x = (SYMBOL_SIZE * SYMBOLS_PER_REEL) / 2;

                if (this.frameSpine.state.hasAnimation('idle')) {
                    this.frameSpine.state.setAnimation(0, 'idle', true);
                }

                this.container.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('big-boom-h.json');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData.spineData);

                // Center the win animation over the slot machine
                const slotWidth = SYMBOL_SIZE * SYMBOLS_PER_REEL + 40;
                const slotHeight = REEL_HEIGHT * REEL_COUNT + REEL_SPACING * (REEL_COUNT - 1) + 40;
                this.winAnimation.x = slotWidth / 2;
                this.winAnimation.y = slotHeight / 2;
                
                this.winAnimation.visible = false;
                this.container.addChild(this.winAnimation);
            }   
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }
}
