import { EVENTS } from '../core/constants.js';
import { missionData } from '../data/missionData.js';
import { controlsData } from '../data/controlsData.js';
const PANEL_IDS = ['mainMenu', 'pauseMenu', 'loadingScreen', 'gameOverMenu', 'missionCompleteMenu'];

export class UIManager {
    constructor(events){
        this.events = events;

        // HUD
        this.hudEl = document.getElementById('hud');
        this.timerEl = document.getElementById('timer');
        this.killCounterEl = document.getElementById('killCounter');
        this.healthBarFillEl = document.getElementById('healthBarFill');
        this.missionBriefingEl = document.getElementById('missionBriefing');

        // UI panels
        this.panels = new Map(PANEL_IDS.map(id => [id, document.getElementById(id)]));

        this._renderControlsLists();
        this.setupEventListeners();
    }
    setupEventListeners(){
        document.querySelectorAll('[data-action="start"]').forEach(btn => btn.addEventListener('click', () => this.events.emit(EVENTS.GAME_START)));
        document.querySelectorAll('[data-action="resume"]').forEach(btn => btn.addEventListener('click', () => this.events.emit(EVENTS.GAME_RESUME)));
        document.querySelectorAll('[data-action="returnToMenu"]').forEach(btn => btn.addEventListener('click', () => this.events.emit(EVENTS.GAME_RETURN_TO_MENU)));
        this.events.on(EVENTS.ENEMY_KILLED_COUNT, (count) => this.updateKillCounter(count));

        document.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('mouseenter', () => this.events.emit(EVENTS.SOUND, 'button_hover')));
    }
    hideAllPanels(){
        this.panels.forEach(panel => panel?.classList.remove('active'));
    }
    showPanel(panelId){
        this.hideAllPanels();
        const panel = this.panels.get(panelId);
        if (!panel){
            console.warn(`[UIManager] Unknown panel "${panelId}"`);
            return;
        }
        panel.classList.add('active');
    }
    showHUD(){
        if (this.hudEl) this.hudEl.style.display = 'block';
    }
    hideHUD(){
        if (this.hudEl) this.hudEl.style.display = 'none';
        this.hideMissionBriefing();
    }
    updateTimer(time){
        if (!this.timerEl) return;
        const mins = Math.floor(time/60);
        const secs = Math.floor(time%60);
        this.timerEl.textContent = `${mins}:${String(secs).padStart(2,'0')}`;
    }
    updateHealthBar(health, maxHealth){
        if (!this.healthBarFillEl) return;
        const pct = Math.min(1, Math.max(0, health / maxHealth));
        this.healthBarFillEl.style.setProperty('--health-pct', pct);
    }
    showMissionBriefing(){
        if (!this.missionBriefingEl) return;
        this.missionBriefingEl.textContent = this.buildMissionBriefingText();
        this.missionBriefingEl.classList.add('visible');
    }
    hideMissionBriefing(){
        this.missionBriefingEl?.classList.remove('visible');
    }
    buildMissionBriefingText(){
        return `Destroy ${missionData.killCount} enemies or survive ${missionData.surviveTime} seconds`;
    }
    updateKillCounter(count){
        if (!this.killCounterEl) return;
        this.killCounterEl.textContent = `${count} / ${missionData.killCount}`;
    }
    _renderControlsLists(){
        const html = controlsData.map(c => `<div>${c.key} - ${c.label}</div>`).join('');
        document.querySelectorAll('[data-controls-list]').forEach(el => {
            el.innerHTML = html;
        });
    }
}