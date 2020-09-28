// internal imports
import { Subject } from "./Interfaces/Subject"
import { Observer } from "./Interfaces/Observer"
import { Input } from "./Interfaces/Input";
import { State } from "./Interfaces/State";
import { Fixture } from "./Interfaces/Fixture";
import { Switcher } from "./Interfaces/Switcher";

export class Camera implements Subject<State>, Observer<State>, Input {
    private observers: Observer<State>[] & Fixture[]= [];
    private subject: Subject<State>;

    port: number
    color: number = 0;
    constructor (switcher: Subject<State> & Switcher, port: number) {
        this.subject = switcher;
        this.subject.registerObserver(this);
        this.port = port
    }

    registerObserver(o: Observer <State> & Fixture): void {
        this.observers.push(o);
    }
    removeObserver(o: Observer <State> & Fixture): void {
        let index = this.observers.indexOf(o);
        this.observers.splice(index, 1);
    }
    notifyObservers(): void {
        throw new Error("Method not implemented.")
    }
    update(state: State): void {
        //console.log(`${Date.now()}: Camera on port ${this.port} >> preview: ${preview} | program: ${program}`)
        for (let observer of this.observers) {
            observer.update(state);
        }
    }

}