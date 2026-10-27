import { ObjectPooler } from '../utils/ObjectPooler.js';
import { Particle } from '../entities/Particle.js';
import { ParticleBehaviourFactory } from '../entities/behaviours/particle/ParticleBehaviourFactory.js';
import { particleData } from '../data/particleData.js';
import { EVENTS, PARTICLE_POOL_SIZE } from '../core/constants.js';

export class ParticleManager {
    constructor(events){
        this.particlePool = new ObjectPooler(() => new Particle(), PARTICLE_POOL_SIZE);
        this._registerEvents(events);
    }
    _registerEvents(events){
        events.on(EVENTS.ENEMY_DAMAGED, (enemy) => {
            const p = enemy.data.particles?.hit;
            if (!p) return;
            this.spawnEffect(p.type, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, {color: enemy.data.color, count: p.count});
        });
        events.on(EVENTS.ENEMY_DIED, (enemy) => {
            const p = enemy.data.particles?.death;
            if (!p) return;
            this.spawnEffect(p.type, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, {color: enemy.data.color, count: p.count});
        });
    }
    spawnEffect(type, x, y, opts = {}){
        const data = particleData[type];
        if (!data){
            console.warn(`Unknown particle type: ${type}`);
            return;
        }
        const count = opts.count ?? data.count;
        const color = opts.color ?? data.color;

        for (let i = 0; i < count; i++){
            const p = this.particlePool.get();
            const angle = Math.random() * Math.PI * 2;
            const speed = data.speed * (0.5 + Math.random() * 0.5);

            p.active = true;
            p.x = x;
            p.y = y;
            p.vx = Math.cos(angle) * speed; 
            p.vy = Math.sin(angle) * speed;
            p.lifetime = data.lifetime;
            p.age = 0;
            p.size = data.size;
            p.baseSize = data.size;
            p.color = color;
            p.fade = data.fade;
            p.shrink = data.shrink;
            p.gravity.x = data.gravity.x;
            p.gravity.y = data.gravity.y;
            p.shape = data.shape ?? 'rectangle';
            p.layer = data.layer ?? 'foreground';
            p.image = data.image ?? null;
            p.behaviour = ParticleBehaviourFactory.create(data.behaviourType, { originX: x, originY: y });
        }
    }
    update(dt){
        this.particlePool.updateAll(dt);
    }
    reset(){
        this.particlePool.releaseAll();
    }
    getActiveParticles(){
        return this.particlePool.active;
    }
}