import * as PIXI from 'pixi.js';
import { SlotMachine } from './slots/SlotMachine';
import { AssetLoader } from './utils/AssetLoader';
import { UI } from './ui/UI';

export class Game {
    private app: PIXI.Application;
    private slotMachine!: SlotMachine;
    private ui!: UI;
    private assetLoader: AssetLoader;
    private readonly CANVAS_WIDTH = 1280;
    private readonly CANVAS_HEIGHT = 800;

    constructor() {
        this.app = new PIXI.Application({
            width: this.CANVAS_WIDTH,
            height: this.CANVAS_HEIGHT,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.app.view as HTMLCanvasElement);
        }

        this.assetLoader = new AssetLoader();

        this.init = this.init.bind(this);
        this.resize = this.resize.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);

        window.addEventListener('resize', this.resize);
        window.addEventListener('keydown', this.handleKeyPress);

        this.resize();
    }

    public async init(): Promise<void> {
        try {
            await this.assetLoader.loadAssets();

            this.slotMachine = new SlotMachine(this.app);
            this.app.stage.addChild(this.slotMachine.container);

            this.ui = new UI(this.app, this.slotMachine);
            this.app.stage.addChild(this.ui.container);

            this.app.ticker.add(this.update.bind(this));

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }

    private update(delta: number): void {
        if (this.slotMachine) {
            this.slotMachine.update(delta);
        }
    }

    private resize(): void {
        if (!this.app || !this.app.renderer) return;

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const w = gameContainer.clientWidth;
        const h = gameContainer.clientHeight;

        // Calculate scale to fit the container while maintaining aspect ratio
        const scale = Math.min(w / this.CANVAS_WIDTH, h / this.CANVAS_HEIGHT);

        this.app.stage.scale.set(scale);

        // Center the stage
        this.app.renderer.resize(w, h);
        this.app.stage.position.set(w / 2, h / 2);
        this.app.stage.pivot.set(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT / 2);
    }

    /**
     * Handles keyboard input
     */
    private handleKeyPress(event: KeyboardEvent): void {
        // Space bar to spin
        if (event.code === 'Space' || event.key === ' ') {
            event.preventDefault(); // Prevent page scroll
            if (this.slotMachine) {
                this.slotMachine.spin();
            }
        }
    }

    /**
     * Cleanup method to properly destroy the game and free resources
     */
    public destroy(): void {
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('keydown', this.handleKeyPress);
        
        if (this.slotMachine) {
            this.slotMachine.destroy();
        }

        if (this.app) {
            this.app.destroy(true, {
                children: true,
                texture: true,
                baseTexture: true,
            });
        }
    }
}
