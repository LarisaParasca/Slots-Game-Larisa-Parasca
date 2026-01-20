import * as PIXI from 'pixi.js';
import { SlotMachine } from '../slots/SlotMachine';
import { AssetLoader } from '../utils/AssetLoader';
import { sound } from '../utils/sound';

// UI constants
const BUTTON_WIDTH = 150;
const BUTTON_HEIGHT = 80;
const BUTTON_Y_OFFSET = 50; // Distance from bottom of screen
const BUTTON_HOVER_SCALE = 1.05;

/**
 * Manages the game UI elements including buttons and interactions
 */
export class UI {
    public container: PIXI.Container;
    private app: PIXI.Application;
    private slotMachine: SlotMachine;
    private spinButton!: PIXI.Sprite;

    constructor(app: PIXI.Application, slotMachine: SlotMachine) {
        this.app = app;
        this.slotMachine = slotMachine;
        this.container = new PIXI.Container();

        this.createSpinButton();
    }

    private createSpinButton(): void {
        try {
            const texture = AssetLoader.getTexture('button_spin.png');
            if (!texture) {
                throw new Error('Spin button texture not found');
            }
            this.spinButton = new PIXI.Sprite(texture);

            this.spinButton.anchor.set(0.5);
            this.spinButton.x = this.app.screen.width / 2;
            this.spinButton.y = this.app.screen.height - BUTTON_Y_OFFSET;
            this.spinButton.width = BUTTON_WIDTH;
            this.spinButton.height = BUTTON_HEIGHT;

            this.spinButton.interactive = true;
            this.spinButton.cursor = 'pointer';

            this.spinButton.on('pointerdown', this.onSpinButtonClick.bind(this));
            this.spinButton.on('pointerover', this.onButtonOver.bind(this));
            this.spinButton.on('pointerout', this.onButtonOut.bind(this));

            this.container.addChild(this.spinButton);

            this.slotMachine.setSpinButton(this.spinButton);
        } catch (error) {
            console.error('Error creating spin button:', error);
        }
    }

    /**
     * Handles spin button click event
     */
    private onSpinButtonClick(): void {
        sound.play('Spin button');
        this.slotMachine.spin();
    }

    /**
     * Handles button hover enter event
     */
    private onButtonOver(event: PIXI.FederatedPointerEvent): void {
        (event.currentTarget as PIXI.Sprite).scale.set(BUTTON_HOVER_SCALE);
    }

    /**
     * Handles button hover exit event
     */
    private onButtonOut(event: PIXI.FederatedPointerEvent): void {
        (event.currentTarget as PIXI.Sprite).scale.set(1.0);
    }
}
