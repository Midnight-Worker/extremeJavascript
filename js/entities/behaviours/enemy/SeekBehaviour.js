export class SeekBehaviour {
    update(enemy, dt, player){
        // calculate direction to player
        const dx = player.x + player.width/2 - (enemy.x + enemy.width/2);
        const dy = player.y + player.height/2 - (enemy.y + enemy.height/2);
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0){
            const nx = dx/len;
            const ny = dy/len;

            enemy.x += nx * enemy.speed * dt;
            enemy.y += ny * enemy.speed * dt;
        }
        enemy.animator.play('move'); 
    }
}