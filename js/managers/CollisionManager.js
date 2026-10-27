import { EVENTS } from '../core/constants.js';

export class CollisionManager {
    constructor(collisionSystem, events){
        this.collisionSystem = collisionSystem;
        this.events = events;
    }

    update(player, enemies){
        this.checkPlayerVsEnemies(player, enemies);
    }

    checkPlayerVsEnemies(player, enemies){
        for (const enemy of enemies){
            if (!enemy.active) continue;
            if (enemy.animator.is('death')) continue;
            if (this.collisionSystem.checkCircleCircle(player, enemy)){

                const dx = (player.x + player.width / 2) - (enemy.x + enemy.width / 2);
                const dy = (player.y + player.height / 2) - (enemy.y + enemy.height / 2);
                const dist = Math.sqrt(dx * dx + dy * dy);
                const nx = dist > 0 ? dx / dist : 1;
                const ny = dist > 0 ? dy / dist : 0;

                const enemyDamageApplied = enemy.takeDamage(player.collisionDamage);
                if (enemyDamageApplied){
                    if (enemy.isDead()){
                        this.events.emit(EVENTS.ENEMY_DIED, enemy);
                    } else {
                        this.events.emit(EVENTS.ENEMY_DAMAGED, enemy);
                        if (enemy.data.pushbackTarget === 'enemy'){
                            enemy.applyPushback(-nx, -ny, enemy.data.pushbackForce);
                        }
                    }
                }

                const playerDamageApplied = player.takeDamage(enemy.damage);
                if (playerDamageApplied){
                    this.events.emit(EVENTS.PLAYER_DAMAGED, player.health, player.maxHealth);
                    if (player.isDead()){
                        this.events.emit(EVENTS.PLAYER_DIED);
                        return;
                    }
                    if (enemy.data.pushbackTarget === 'player'){
                        player.applyPushback(nx, ny, player.pushbackForce);
                    }
                }
            }
        }
    }
}