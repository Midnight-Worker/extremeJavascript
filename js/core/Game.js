import { GAME_WIDTH, GAME_HEIGHT, ASPECT_RATIO, CANVAS_MARGIN, GAME_STATES, EVENTS} from './constants.js';
import { EventEmitter } from './EventEmitter.js';
import { RenderSystem } from '../systems/RenderSystem.js';
import { Player } from '../entities/Player.js';
import { ImageManager } from '../managers/ImageManager.js';
import { AudioManager } from '../managers/AudioManager.js';
import { UIManager } from '../managers/UIManager.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { EnemySpawner } from '../managers/EnemySpawner.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { missionData } from '../data/missionData.js';
import { ParticleManager } from '../managers/ParticleManager.js';

export class Game {
    constructor(){
        this.canvas = document.getElementById('gameCanvas');
        this.events = new EventEmitter();

        this.imageManager = new ImageManager();
        this.audioManager = new AudioManager(this.events);
        this.particleManager = new ParticleManager(this.events);
        this.uiManager = new UIManager(this.events);
        this.enemyManager = new EnemyManager();
        this.enemySpawner = new EnemySpawner(this.enemyManager);

        this.renderSystem = new RenderSystem(this.canvas, this.imageManager);
        this.collisionSystem = new CollisionSystem();
        this.collisionManager = new CollisionManager(this.collisionSystem, this.events);
        this.player = new Player();
        this.keys = {};
        this.lastTime = 0;
        this.time = 0;
        this.missionBriefingEndsAt = null;
        this.state = GAME_STATES.MENU;
        this.debug = false;

        this.enemiesKilled = 0;
        this.missionCompleted = false;
 
        this.init();
    }
    async init(){
        await Promise.all([
            this.imageManager.loadAll(),
            this.audioManager.loadAll()
        ]);
        
        // Game state events
        this.events.on(EVENTS.GAME_START, () => this.startGame());
        this.events.on(EVENTS.GAME_RESUME, () => this.resume());
        this.events.on(EVENTS.GAME_RETURN_TO_MENU, () => this.returnToMenu());
        this.events.on(EVENTS.MISSION_COMPLETE, () => this.missionComplete());

        // Player related events
        this.events.on(EVENTS.PLAYER_DAMAGED, (health, maxHealth) => {
            if (!this.player.isDead()){
                this.events.emit(EVENTS.SOUND, 'player_hurt');
            }
            this.uiManager.updateHealthBar(health, maxHealth);
        });
        this.events.on(EVENTS.PLAYER_DIED, () => {
            this.events.emit(EVENTS.SOUND, 'game_over');
        });
        this.events.on(EVENTS.ENEMY_DIED, () => {
            this.enemiesKilled++;
            this.events.emit(EVENTS.ENEMY_KILLED_COUNT, this.enemiesKilled);
        });

        this.uiManager.showPanel('mainMenu');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.setupInput();

        // start game loop
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    gameLoop(timestamp){
        const dt = Math.min((timestamp - this.lastTime)/1000, 0.1);
        this.lastTime = timestamp;

        if (this.state === GAME_STATES.PLAYING) {
            this.time += dt;
            this.uiManager.updateTimer(this.time);
            
            if (this.missionBriefingEndsAt !== null && this.time >= this.missionBriefingEndsAt){
                this.uiManager.hideMissionBriefing();
                this.missionBriefingEndsAt = null;
            }
        }
        
        const activeEnemies = this.enemyManager.getActiveEnemies();
        this.update(dt, activeEnemies);
        this.checkMissionConditions();
        this.renderSystem.render(this.state, this.player, activeEnemies, this.particleManager.getActiveParticles(), this.debug);
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    update(dt, activeEnemies){
        if (this.state !== GAME_STATES.PLAYING) return;
        
        this.player.update(dt, this.keys);
        this.particleManager.update(dt);
        this.enemyManager.update(dt, this.player);
        
        if (this.player.isDead()){
            if (this.player.isDeathFinished()) this.gameOver();
            return;
        }
        
        this.enemySpawner.update(dt);
        this.collisionManager.update(this.player, activeEnemies);
    }
    setupInput(){
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Esc toggles pause
            if (e.key === 'Escape' && !e.repeat){
                if (this.state === GAME_STATES.PLAYING){
                    this.pause();
                } else if (this.state === GAME_STATES.PAUSED){
                    this.resume();
                }
            }
            // ` toggles debug mode
            if (e.key === '`' && !e.repeat){
                this.debug = !this.debug;
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        // Clear all keys when context menu opens
        window.addEventListener('contextmenu', () => {
            this.keys = {};
        });
        // Clear all keys when window loses focus
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }
    startGame(){
        this.events.emit(EVENTS.SOUND, 'button_click');
        this.state = GAME_STATES.PLAYING;
        this.uiManager.hideAllPanels();
        this.keys = {};
        this.time = 0;
        this.enemiesKilled = 0;
        this.missionCompleted = false;
        this.uiManager.showHUD();
        this.uiManager.showMissionBriefing();
        this.missionBriefingEndsAt = this.time + (missionData.briefingDuration);

        this.player.reset();
        this.enemyManager.reset();
        this.enemySpawner.reset();
        this.particleManager.reset();

        this.uiManager.updateHealthBar(this.player.health, this.player.maxHealth);
        this.uiManager.updateKillCounter(this.enemiesKilled);
        this.lastTime = performance.now();
    }
    pause(){
        this.events.emit(EVENTS.SOUND, 'pause');
        this.state = GAME_STATES.PAUSED;
        this.uiManager.showPanel('pauseMenu');
    }
    resume(){
        this.events.emit(EVENTS.SOUND, 'unpause');
        this.state = GAME_STATES.PLAYING;
        this.uiManager.hideAllPanels();
    }
    returnToMenu(){
        this.events.emit(EVENTS.SOUND, 'button_click');
        this.state = GAME_STATES.MENU;
        this.uiManager.hideAllPanels();
        this.uiManager.hideHUD();
        this.uiManager.showPanel('mainMenu');
    }
    gameOver(){
        this.state = GAME_STATES.GAME_OVER;
        this.uiManager.hideHUD();
        this.uiManager.showPanel('gameOverMenu');
    }
    resizeCanvas(){
        let w, h;

        const availableWidth = window.innerWidth - CANVAS_MARGIN * 2;
        const availableHeight = window.innerHeight - CANVAS_MARGIN * 2;

        if (availableWidth/availableHeight > ASPECT_RATIO){
            h = availableHeight;
            w = h * ASPECT_RATIO;
        } else {
            w = availableWidth;
            h = w / ASPECT_RATIO;
        }

        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;

        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.canvas.style.margin = `${CANVAS_MARGIN}px`;

        this.renderSystem.applySettings();
    }
    checkMissionConditions(){
        if (this.state !== GAME_STATES.PLAYING) return;
        if (this.missionCompleted) return;
        if (this.player.isDead()) return;
        if (this.enemiesKilled >= missionData.killCount || this.time >= missionData.surviveTime){
            this.missionCompleted = true;
            this.events.emit(EVENTS.MISSION_COMPLETE);
        }
    }
    missionComplete(){
        this.state = GAME_STATES.MISSION_COMPLETE;
        this.uiManager.hideHUD();
        this.uiManager.showPanel('missionCompleteMenu');
        this.events.emit(EVENTS.SOUND, 'mission_complete');
    }
}