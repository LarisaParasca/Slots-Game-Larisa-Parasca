import { Howl } from 'howler';

const sounds: Record<string, Howl> = {};

export const sound = {
    add: (alias: string, url: string): void => {
        sounds[alias] = new Howl({
            src: [url],
            html5: false,
            preload: true,
            volume: 0.7,
        });
    },
    play: (alias: string): void => {
        sounds[alias]?.play();
    },
    stop: (alias: string): void => {
        sounds[alias]?.stop();
    }
};
