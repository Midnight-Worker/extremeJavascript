export class RadialBehaviour {
    update(particle, dt){
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx += particle.gravity.x * dt;
        particle.vy += particle.gravity.y * dt;
    }
}