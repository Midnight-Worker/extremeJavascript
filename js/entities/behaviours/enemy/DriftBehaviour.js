const MOVE_DURATION     = 7;
const IDLE_DURATION_MIN = 2;
const IDLE_DURATION_MAX = 5;

export class DriftBehaviour {
    constructor(){
        this.angle = 0;
        this.phaseTimer    = 0;
        this.phaseDuration = MOVE_DURATION;
        this.idling        = false;
        this.firstMove     = true; 
    }
    update(enemy, dt, player){
        if (this.firstMove){
            this.firstMove = false;
            const dx = (player.x + player.width / 2) - (enemy.x + enemy.width / 2);
            const dy = (player.y + player.height / 2) - (enemy.y + enemy.height / 2);
            this.angle = Math.atan2(dy, dx);
        }

        this.phaseTimer += dt;
        if (this.phaseTimer >= this.phaseDuration){
            this.phaseTimer = 0;
            if (this.idling){
                this.angle = Math.random() * Math.PI * 2;
                this.phaseDuration = MOVE_DURATION;
            } else {
                this.phaseDuration = IDLE_DURATION_MIN + Math.random() * (IDLE_DURATION_MAX - IDLE_DURATION_MIN);
            }
            this.idling = !this.idling;
        }

        if (!this.idling){
            const dx = Math.cos(this.angle);
            const dy = Math.sin(this.angle);
            enemy.x += dx * enemy.speed * dt;
            enemy.y += dy * enemy.speed * dt;
        }
        enemy.animator.play(this.idling ? 'idle' : 'move');
    }
    reset(){
        this.angle = 0;
        this.phaseTimer    = 0;
        this.phaseDuration = MOVE_DURATION;
        this.idling        = false;
        this.firstMove     = true;
    }
}