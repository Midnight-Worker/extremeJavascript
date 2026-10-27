export const enemyData = {
    drifter: {
        width: 64,
        height: 48,
        speed: 30,
        health: 3,
        damage: 1,
        collisionRadius: 24,
        behaviourType: 'drift',
        color: '#ff4444',
        pushbackTarget: 'player',
        sounds: {
            hit:   'enemy_drifter_hit',
            death: 'enemy_drifter_death',
        },
        particles: {
            hit:   { type: 'smoke',  count: 6  },
            death: { type: 'implosion', count: 25 },
        },
        animData: {
            sheets:       ['enemy_drifter_sheet', 'enemy_drifter_sheet2'],
            frameWidth:   64,
            frameHeight:  48,
            initialState: 'idle',
            states: {
                idle:   { row: 0, frameCount: 8,  frameInterval: 0.15, startFrame: 0, loop: true  },
                move:   { row: 1, frameCount: 6,  frameInterval: 0.15, startFrame: 0, loop: true  },
                hit:    { row: 2, frameCount: 6,  frameInterval: 0.15, startFrame: 0, loop: false, locked: true, next: 'idle' },
                death:  { row: 3, frameCount: 8,  frameInterval: 0.1,  startFrame: 0, loop: false, locked: true },
            }
        }

    },
    seeker: {
        width: 64,
        height: 64,
        speed: 60,
        health: 2,
        damage: 1,
        collisionRadius: 14,
        behaviourType: 'seek',
        color: '#000',
        pushbackForce: 580,
        pushbackTarget: 'enemy',
        sounds: {
            hit:   'enemy_seeker_hit',
            death: 'enemy_seeker_death',
        },
        particles: {
            hit:   { type: 'sparks', count: 10  },
            death: { type: 'implosion',  count: 17 },
        },
        animData: {
            sheets:       ['enemy_seeker_sheet', 'enemy_seeker_sheet2'],
            frameWidth:   64,
            frameHeight:  64,
            initialState: 'move',
            states: {
                move:  { row: 0, frameCount: 9,  frameInterval: 0.15, startFrame: 0, loop: true  },
                hit:   { row: 1, frameCount: 7,  frameInterval: 0.15, startFrame: 0, loop: false, locked: true, next: 'move' },
                death: { row: 2, frameCount: 11, frameInterval: 0.1,  startFrame: 0, loop: false, locked: true },
            }
        }
    },
};