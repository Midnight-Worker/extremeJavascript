export class Particle {
    constructor(){
        this.gravity = { x: 0, y: 0 };
        this.reset();
    }
    update(dt){
        if (!this.active) return;
        this.age += dt;
        if (this.age >= this.lifetime){
            this.active = false;
            return;
        }
        if (this.shrink){
            this.size = this.baseSize * (1 - this.age / this.lifetime);
        }

        this.behaviour?.update(this, dt);
    }
    reset(){
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.age = 0;
        this.lifetime = 1;
        this.size = 4;
        this.baseSize = 4;
        this.color = '#fff';
        this.fade = false;
        this.shrink = false;
        this.gravity.x = 0;
        this.gravity.y = 0;
        this.behaviour = null;
        this.shape = 'rectangle';
        this.layer = 'foreground';
        this.image = null;
    }
}