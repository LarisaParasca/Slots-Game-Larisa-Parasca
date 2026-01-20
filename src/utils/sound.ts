import { Howl } from 'howler';

// Internal sound storage
const sounds: Record<string, Howl> = {};

// Default sound configuration
const DEFAULT_VOLUME = 0.7;

/**
 * Sound manager for playing game audio effects
 */
export const sound = {
    /**
     * Adds a sound to the sound manager
     * @param alias - Unique identifier for the sound
     * @param url - Path to the sound file
     */
    add: (alias: string, url: string): void => {
        sounds[alias] = new Howl({
            src: [url],
            html5: false,
            preload: true,
            volume: DEFAULT_VOLUME,
        });
    },
    /**
     * Plays a sound by its alias
     * @param alias - The alias of the sound to play
     */
    play: (alias: string): void => {
        sounds[alias]?.play();
    },
    /**
     * Stops a playing sound by its alias
     * @param alias - The alias of the sound to stop
     */
    stop: (alias: string): void => {
        sounds[alias]?.stop();
    }
};
