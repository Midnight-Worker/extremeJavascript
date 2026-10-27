import { RadialBehaviour } from './RadialBehaviour.js';
import { ImplosionBehaviour } from './ImplosionBehaviour.js';

export class ParticleBehaviourFactory {
    static create(behaviourType, opts = {}){
        switch(behaviourType){
            case 'radial':
                return new RadialBehaviour();
            case 'implosion':
                return new ImplosionBehaviour(opts.originX, opts.originY);
            default:
                console.warn(`Unknown particle behaviour type: ${behaviourType}`);
                return new RadialBehaviour();
        }
    }
}