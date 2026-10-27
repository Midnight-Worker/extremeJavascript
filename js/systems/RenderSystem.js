import { GAME_WIDTH, GAME_HEIGHT, GRID_SIZE, GAME_STATES } from '../core/constants.js';
const FLASH_MIN_ALPHA   = 0.1;
const FLASH_ALPHA_RANGE = 0.8;
const FLASH_SPEED       = 10;

const HEALTH_BAR_HEIGHT = 4;
const HEALTH_BAR_OFFSET = 6;
const HEALTH_BAR_BG     = 'rgba(0, 0, 0, 0.6)';
const HEALTH_BAR_FILL   = '#ff5f6d';

export class RenderSystem {
    constructor(canvas, imageManager){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.imageManager = imageManager;
        this.applySettings();
    }
    applySettings(){
        this.ctx.imageSmoothingEnabled = false;
    }
    render(state, player, enemies = [], particles = [], debug = false){
        if (state === GAME_STATES.MENU){
            this.renderMenuBackground();
        } else {
            this.ctx.fillStyle = '#0f3460';
            this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            this.renderGrid();
            this.renderParticles(particles, 'background');
            this.renderEnemies(enemies);
            this.renderPlayer(player);
            this.renderParticles(particles, 'foreground');
            if (debug) this.renderDebugOverlay(player, enemies);
        }
    }
    renderPlayer(player){
        if (player.invincible && !player.animator.is('death')){
            this.ctx.globalAlpha = FLASH_MIN_ALPHA + FLASH_ALPHA_RANGE * Math.abs(Math.sin(player.invincibilityTimer * FLASH_SPEED));
        }

        const frame = player.animator.getCurrentFrame();
        const sheetImage = frame ? this.imageManager.get(frame.sheet) : null;
        const x = this._snap(player.x);
        const y = this._snap(player.y);

        if (frame && sheetImage){
            this.ctx.drawImage(
                sheetImage,
                frame.sx, frame.sy, frame.sw, frame.sh,
                x, y, player.width, player.height
            );
        } else {
            // fallback
            this.ctx.fillStyle = '#1a1a2e';
            this.ctx.fillRect(x, y, player.width, player.height);
        }

        this.ctx.globalAlpha = 1;
    }
    renderParticles(particles, layer){
        for (let i = 0; i < particles.length; i++){
            const p = particles[i];
            if (!p.active || p.layer !== layer) continue;
            if (p.fade){
                this.ctx.globalAlpha = 1 - p.age / p.lifetime;
            }

            switch(p.shape){
                 case 'circle':
                    this.drawCircleParticle(p);
                    break;
                case 'image':
                    this.drawImageParticle(p);
                    break;
                case 'rectangle':
                default:
                    this.drawRectangleParticle(p);
                    break;    
            }
            this.ctx.globalAlpha = 1;
        }
    }
    drawRectangleParticle(p){
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    drawCircleParticle(p){
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    drawImageParticle(p){
        const img = p.image ? this.imageManager.get(p.image) : null;
        if (img){
            const x = this._snap(p.x - p.size / 2);
            const y = this._snap(p.y - p.size / 2);
            this.ctx.drawImage(img, x, y, p.size, p.size);
        } else {
            this.drawRectangleParticle(p);
        }
    }
    renderEnemies(enemies){
        for (let i = 0; i < enemies.length; i++){
            const enemy = enemies[i];
            if (!enemy.active) continue; 

            const frame = enemy.animator.getCurrentFrame();
            const sheetImage = frame ? this.imageManager.get(frame.sheet) : null;
            const x = this._snap(enemy.x);
            const y = this._snap(enemy.y);

            if (enemy.invincible && !enemy.animator.is('death')){
                this.ctx.globalAlpha = FLASH_MIN_ALPHA + FLASH_ALPHA_RANGE * Math.abs(Math.sin(enemy.invincibilityTimer * FLASH_SPEED));
            }

            if (frame && sheetImage){
                this.ctx.save();
                if (enemy.facingLeft){
                    this.ctx.translate(x + enemy.width, y);
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(sheetImage, frame.sx, frame.sy, frame.sw, frame.sh, 0, 0, enemy.width, enemy.height);
                } else {
                    this.ctx.drawImage(sheetImage, frame.sx, frame.sy, frame.sw, frame.sh, x, y, enemy.width, enemy.height);

                }
                this.ctx.restore();
            } else {
                // fallback
                this.ctx.fillStyle = enemy.data.color;
                this.ctx.fillRect(x, y, enemy.width, enemy.height);
            }
            
            this.ctx.globalAlpha = 1;

            if (enemy.health < enemy.data.health && !enemy.animator.is('death')){
                this.renderEnemyHealthBar(enemy);
            }
        }
    }
    renderEnemyHealthBar(enemy){
        const percent = enemy.health / enemy.data.health;
        const x = this._snap(enemy.x);
        const y = this._snap(enemy.y - HEALTH_BAR_OFFSET - HEALTH_BAR_HEIGHT);
        const w = enemy.width;

        this.ctx.fillStyle = HEALTH_BAR_BG;
        this.ctx.fillRect(x, y, w, HEALTH_BAR_HEIGHT);

        this.ctx.fillStyle = HEALTH_BAR_FILL;
        this.ctx.fillRect(x, y, Math.ceil(w * percent), HEALTH_BAR_HEIGHT);
    }

    renderGrid(){
        this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        for (let i = 0; i < GAME_WIDTH; i += GRID_SIZE){
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, GAME_HEIGHT);
        }
        for (let i = 0; i < GAME_HEIGHT; i += GRID_SIZE){
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(GAME_WIDTH, i);
        }
        this.ctx.stroke();
    }
    renderMenuBackground(){
        this.ctx.fillStyle = '#0f3460';
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }
    renderDebugOverlay(player, enemies){
        this.ctx.save();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'green';
        
        this.ctx.beginPath();
        this.ctx.arc(player.x + player.width/2, player.y + player.height/2, player.collisionRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        for (const enemy of enemies){
            if (!enemy.active) continue;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.collisionRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }
    _snap(value){
        return Math.round(value);
    }
}