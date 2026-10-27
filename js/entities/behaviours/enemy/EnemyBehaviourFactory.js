import { SeekBehaviour } from './SeekBehaviour.js';
import { DriftBehaviour } from './DriftBehaviour.js';

export class EnemyBehaviourFactory {
    static create(behaviourType){
        switch(behaviourType){
            case 'seek':
                return new SeekBehaviour();
            case 'drift':
                return new DriftBehaviour();
            default:
                console.warn(`Unknown behaviour type: ${behaviourType}`);
                return new SeekBehaviour(); // fallback
        }
    }
}