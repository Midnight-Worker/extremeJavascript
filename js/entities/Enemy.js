import { GAME_WIDTH, GAME_HEIGHT, ENEMY_DESPAWN_MARGIN, ENEMY_HIT_INVINCIBILITY_DURATION, PUSHBACK_DECAY } from '../core/constants.js';
import { AnimatorController } from '../utils/AnimatorController.js';

export class Enemy {
    constructor(data, behaviour){
        this.data = data;
        this.behaviour = behaviour;
        // Position and dimensions
        this.x = 0;
        this.y = 0;
        this.width = data.width;
        this.height = data.height;
        // Stats
        this.health = data.health;
        this.speed = data.speed;
        this.damage = data.damage;
        this.collisionRadius = data.collisionRadius;
        this.active = false;
        this.facingLeft = false;
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.pushVx = 0;
        this.pushVy = 0;
        this.animator = new AnimatorController(data.animData);
    }
    spawn(x, y){
        this.reset();
        this.x = x;
        this.y = y;
        this.active = true;
        this.animator.reset(this.data.animData.initialState);
    }
    reset(){
        this.active = false;
        this.health = this.data.health;
        this.pushVx = 0;
        this.pushVy = 0;
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.facingLeft = false;
        if (this.behaviour.reset){
            this.behaviour.reset();
        }
    }
    update(dt, player){
        if (!this.active) return;

        this._updatePushback(dt);
        this._updateInvincibility(dt);

        if (this.animator.is('death')){
            this.animator.update(dt);
            if (this.animator.finished) this.active = false;
            return;
        }

        // despawn if too far offscreen
        if (this.x < -ENEMY_DESPAWN_MARGIN ||
            this.x > GAME_WIDTH + ENEMY_DESPAWN_MARGIN ||
            this.y < -ENEMY_DESPAWN_MARGIN ||
            this.y > GAME_HEIGHT + ENEMY_DESPAWN_MARGIN
        ) {
            this.active = false;
            return;
        }       

        if (!this.animator.is('hit')){
            const oldX = this.x;
            this.behaviour.update(this, dt, player);
            if (this.x !== oldX) this.facingLeft = this.x < oldX;
        }
        this.animator.update(dt);
    }
    _updatePushback(dt){
        if (this.pushVx !== 0 || this.pushVy !== 0){
            this.x += this.pushVx * dt;
            this.y += this.pushVy * dt;

            const speed = Math.sqrt(this.pushVx * this.pushVx + this.pushVy * this.pushVy);
            const decay = PUSHBACK_DECAY * dt;
            if (speed <= decay){
                this.pushVx = 0;
                this.pushVy = 0;
            } else {
                const ratio = (speed - decay) / speed;
                this.pushVx *= ratio;
                this.pushVy *= ratio;
            }
        }
    }
    _updateInvincibility(dt){
        if (this.invincible){
            this.invincibilityTimer -= dt;
            if (this.invincibilityTimer <= 0){
                this.invincible = false;
                this.invincibilityTimer = 0;
            }
        }
    }
    applyPushback(dirX, dirY, force){
        this.pushVx = dirX * force;
        this.pushVy = dirY * force;
    }
    takeDamage(amount){
        if (this.invincible) return false;

        this.health = Math.max(0, this.health - amount);
        this.invincible = true;
        this.invincibilityTimer = ENEMY_HIT_INVINCIBILITY_DURATION;
        this.animator.play(this.health <= 0 ? 'death' : 'hit', { force: true });
        return true;
    }
    isDead(){
        return this.animator.is('death');
    }
}