export class AnimatorController {
    constructor(animData){
        this.sheets      = animData.sheets;
        this.frameWidth  = animData.frameWidth;
        this.frameHeight = animData.frameHeight;
        this.states      = animData.states;

        this.sheet        = null;
        this.currentName  = null; 
        this.currentState = null;
        this.currentFrame = 0;
        this.frameTimer   = 0;
        this.finished     = false;

        this._frame = { sheet: null, sx: 0, sy: 0, sw: 0, sh: 0 };
        this.pickSheet();
        this.play(animData.initialState, { force: true });
    }

    pickSheet(){
        this.sheet = this.sheets[Math.floor(Math.random() * this.sheets.length)];
    }

    is(name){
        return this.currentName === name;
    }

    play(name, { force = false } = {}){
        const state = this.states[name];
        if (!state){
            console.warn(`[Animator] Unknown state "${name}". Valid: ${Object.keys(this.states).join(', ')}`);
            return false;
        }
        if (!force && name === this.currentName && !this.finished) return false;
        if (!force && this.currentState?.locked) return false;

        this.currentName    = name;
        this.currentState = state;
        this.currentFrame = state.startFrame;
        this.frameTimer   = 0;
        this.finished     = false;
        return true;
    }

    update(dt){
        if (!this.currentState || this.finished) return;

        this.frameTimer += dt;
        if (this.frameTimer >= this.currentState.frameInterval){
            this.frameTimer -= this.currentState.frameInterval;
            this.currentFrame++;
            const lastFrame = this.currentState.startFrame + this.currentState.frameCount - 1;
            if (this.currentFrame > lastFrame) {
                if (this.currentState.loop){
                    this.currentFrame = this.currentState.startFrame;
                } else {
                    this.currentFrame = lastFrame;
                    this.finished     = true;
                    if (this.currentState.next){
                        this.play(this.currentState.next, { force: true });
                    }
                }
            }
        }
    }

    getCurrentFrame(){
        if (!this.currentState) return null;
        const f = this._frame;
        f.sheet  = this.sheet;
        f.sx     = this.currentFrame * this.frameWidth;
        f.sy     = this.currentState.row * this.frameHeight;
        f.sw     = this.frameWidth;
        f.sh     = this.frameHeight;
        return f;
    }

    reset(initialState){
        this.pickSheet();
        this.currentName  = null;
        this.currentState = null;
        this.currentFrame = 0;
        this.frameTimer   = 0;
        this.finished     = false;
        this.play(initialState, { force: true });
    }
}