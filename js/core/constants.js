export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GRID_SIZE = 40;
export const ASPECT_RATIO = 16/9;
export const CANVAS_MARGIN = 15;

export const GAME_STATES = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver',
    MISSION_COMPLETE: 'missionComplete',
};

export const ENEMY_DESPAWN_MARGIN = 200;
export const ENEMY_SPAWN_MARGIN = 100;
export const ENEMY_SPAWN_INTERVAL = 2;
export const ENEMY_HIT_INVINCIBILITY_DURATION = 1.5;
export const PUSHBACK_DECAY = 800;

export const ENEMY_POOL_SIZE = 10;
export const PARTICLE_POOL_SIZE = 200;

export const EVENTS = {
    // Audio
    SOUND: 'sound',
    // Game state
    GAME_START: 'game:start',
    GAME_RESUME: 'game:resume',
    GAME_RETURN_TO_MENU: 'game:returnToMenu',
    MISSION_COMPLETE: 'mission:complete',
    // player
    PLAYER_DAMAGED: 'player:damaged',
    PLAYER_DIED: 'player:died',
    // enemy
    ENEMY_DAMAGED: 'enemy:damaged',
    ENEMY_DIED: 'enemy:died',
    ENEMY_KILLED_COUNT: 'enemy:killedCount',
};