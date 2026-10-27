const HOVER_DURATION_MIN = 0.2;
const HOVER_DURATION_MAX = 0.6;
const BURST_DURATION = 0.25;
const BURST_DRAG = 3;
const ARRIVE_RADIUS = 5;
const IMPLODE_ACCEL = 700;

export class ImplosionBehaviour {
    constructor(originX, originY) {
        this.originX = originX;
        this.originY = originY;
        this.hoverDuration = HOVER_DURATION_MIN + Math.random() * (HOVER_DURATION_MAX - HOVER_DURATION_MIN);
    }
    update(particle, dt){
        const age = particle.age;
        if (age < BURST_DURATION){
            // Phase 1: burst outward with drag
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
            particle.vx *= Math.exp(-BURST_DRAG * dt);
            particle.vy *= Math.exp(-BURST_DRAG * dt);
        } else if (age < BURST_DURATION + this.hoverDuration) {
            // Phase 2: hover
        } else {
            // Phase 3: accelerate toward origin
            const dx = this.originX - particle.x;
            const dy = this.originY - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ARRIVE_RADIUS){
                particle.active = false;
                return;
            }
            const nx = dx / dist;
            const ny = dy / dist;
            particle.vx += nx * IMPLODE_ACCEL * dt;
            particle.vy += ny * IMPLODE_ACCEL * dt;
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;
        }
    }
}