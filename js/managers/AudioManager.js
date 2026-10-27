import { audioData } from '../data/audioData.js';
import { EVENTS } from '../core/constants.js';
const MAX_CHANNELS_PER_SOUND = 4;

export class AudioManager {
    constructor(events){
        this.sounds = {};
        this._registerEvents(events);
    }

    _registerEvents(events){
        events.on(EVENTS.SOUND, (name) => this.play(name));
        events.on(EVENTS.ENEMY_DAMAGED, (enemy) => this.play(enemy.data.sounds?.hit));
        events.on(EVENTS.ENEMY_DIED, (enemy) => this.play(enemy.data.sounds?.death));
    }

    load(name, path){
        return new Promise((resolve) => {
            const audio = new Audio();
            this.sounds[name] = { audio, loaded: false, channels: [] };
    
            audio.onloadeddata = () => {
                this.sounds[name].loaded = true;
                this.sounds[name].channels.push(audio);
                resolve();
            };
            audio.onerror = () => {
                console.warn(`Audio failed: ${name} (will skip)`);
                resolve();
            };
            audio.src = path;
        });
    }

    play(name){
        if (!name) return;
        const sound = this.sounds[name];
        if (!sound?.loaded) return;

        let channel = sound.channels.find(c => c.paused);
        if (!channel){
            if (sound.channels.length < MAX_CHANNELS_PER_SOUND){
                channel = sound.audio.cloneNode();
                sound.channels.push(channel);
            } else {
                channel = sound.channels.shift();
                sound.channels.push(channel);
            }
        }

        channel.currentTime = 0;
        channel.play().catch(err => console.warn(`Could not play ${name}:`, err));
    }

    async loadAll(){
        await Promise.all(audioData.map(({ name, path }) => this.load(name, path)));
    }
}