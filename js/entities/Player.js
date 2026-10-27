import { GAME_WIDTH, GAME_HEIGHT, PUSHBACK_DECAY } from '../core/constants.js';
import { playerData } from '../data/playerData.js';
import { AnimatorController } from '../utils/AnimatorController.js';

export class Player {
    constructor(){
        this.width = playerData.width;
        this.height = playerData.height;
        this.x = (GAME_WIDTH - this.width) / 2;
        this.y = (GAME_HEIGHT - this.height) / 2;
        this.collisionRadius = playerData.collisionRadius;
        this.collisionDamage = playerData.collisionDamage;
        this.invincibilityDuration = playerData.invincibilityDuration;
        this.invincible = false;
        this.invincibilityTimer = 0;

        this.speed = playerData.speed;
        this.maxHealth = playerData.maxHealth;
        this.health = this.maxHealth;

        // Multipliers (for upgrades)
        this.speedMultiplier = 1;

        this.pushbackForce = playerData.pushbackForce;
        this.pushVx = 0;
        this.pushVy = 0;
        this.animator = new AnimatorController(playerData.animData);
    }
    reset(){
        this.x = (GAME_WIDTH - this.width) / 2;
        this.y = (GAME_HEIGHT - this.height) / 2;
        this.speed = playerData.speed;
        this.speedMultiplier = 1;
        this.health = this.maxHealth;
        this.invincible = false;
        this.invincibilityTimer = 0;
        this.pushVx = 0;
        this.pushVy = 0;
        this.animator.reset(playerData.animData.initialState);
    }
    update(dt, keys){
        this._updatePushback(dt);
        this._updateInvincibility(dt);

        if (!this.animator.is('death') && !this.animator.is('hit')){
            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup']) dy -= 1;
            if (keys['s'] || keys['arrowdown']) dy += 1;
            if (keys['a'] || keys['arrowleft']) dx -= 1;
            if (keys['d'] || keys['arrowright']) dx += 1;
    
            // Normalize diagonal movement
            if (dx || dy){
                const len = Math.sqrt(dx * dx + dy * dy);
                dx /= len;
                dy /= len;
    
                this.x += dx * this.speed * this.speedMultiplier * dt;
                this.y += dy * this.speed * this.speedMultiplier * dt;
            }

            let intent;
            if      (keys['a'] || keys['arrowleft'])  intent = 'moveLeft';
            else if (keys['d'] || keys['arrowright']) intent = 'moveRight';
            else if (keys['w'] || keys['arrowup'])    intent = 'moveUp';
            else if (keys['s'] || keys['arrowdown'])  intent = 'moveDown';
            else                                      intent = 'idle';
            this.animator.play(intent);
        }
        this.animator.update(dt);
        this._clampToBounds();
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
    _clampToBounds(){
        this.x = Math.max(0, Math.min(GAME_WIDTH - this.width, this.x));
        this.y = Math.max(0, Math.min(GAME_HEIGHT - this.height, this.y));
    }
    applyPushback(dirX, dirY, force){
        this.pushVx = dirX * force;
        this.pushVy = dirY * force;
    }
    takeDamage(amount){
        if (this.invincible) return false;

        this.health = Math.max(0, this.health - amount);
        this.invincible = true;
        this.invincibilityTimer = this.invincibilityDuration;
        this.animator.play(this.health <= 0 ? 'death' : 'hit', { force: true });
        return true;
    }
    isDead(){
        return this.animator.is('death');
    }
    isDeathFinished(){
        return this.animator.is('death') && this.animator.finished;
    }
}