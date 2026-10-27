export class EventEmitter {
    constructor(){
        this.listeners = {};
    }
    on(event, fn){
        (this.listeners[event] ??= []).push(fn);
    }
    off(event, fn){
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(l => l !== fn);
    }
    emit(event, ...args){
        this.listeners[event]?.forEach(fn => fn(...args));
    }
}