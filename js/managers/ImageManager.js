import { playerData } from '../data/playerData.js';
import { enemyData } from '../data/enemyData.js';
import { particleData } from '../data/particleData.js';

export class ImageManager {
    constructor(){
        this.images = {};
    }

    load(name, path){
        return new Promise((resolve) => {
            const img = new Image();
            
            this.images[name] = { img, loaded:false };
            
            img.onload = () => {
                this.images[name].loaded = true;
                resolve();
            };
            
            img.onerror = () => {
                console.warn(`Image failed: ${name} (will use fallback)`);
                resolve();
            };

            img.src = path;
        });
    }

    get(name){
        return this.images[name]?.loaded ? this.images[name].img : null;
    }

    async loadAll(){
        const imageEntries = [
            ...Object.values(enemyData).flatMap(e =>
                e.animData.sheets.map(sheet => ({ name: sheet, path: `./images/${sheet}.png` }))
            ),
            ...playerData.animData.sheets.map(sheet => ({ name: sheet, path: `./images/${sheet}.png` })),
            ...Object.values(particleData).filter(p => p.shape === 'image' && p.image).map(p =>({ name: p.image, path: `./images/${p.image}.png` })),
        ];

        await Promise.all(imageEntries.map(({ name, path }) => this.load(name, path)));
    }
}