import { DMX } from "./Interfaces/DMX";
import { Fixture } from "./Interfaces/Fixture";
import { Input } from "./Interfaces/Input";
import { NetworkDevice } from "./Interfaces/NetworkDevice";
import { Observer } from "./Interfaces/Observer";
import { State } from "./Interfaces/State";
import { Subject } from "./Interfaces/Subject";
import { SubjectLite } from "./Interfaces/SubjectLite";

export class Tally implements Observer<State>, SubjectLite<DMX>, Fixture {
    startDmx: number;
    fix_def: {r: number, g?: number, i?: number}
    data: any[];
    private subject: Subject<State>;
    private observer: Observer<DMX>;

    constructor (camera: Subject<State> & Input, node: Observer<DMX> & NetworkDevice, startDmx: number, fix_def: {r: number, g?: number, i?: number}) {
        this.subject = camera
        this.observer = node
        this.startDmx = startDmx
        this.fix_def = fix_def
        
        this.subject.registerObserver(this);

        //console.log(`Tally for Camera ${camera.port} with DMX config ${JSON.stringify(fix_def)}`);

        let arr: any[] = Object.values(this.fix_def);
        let max = Math.max(...arr);
        this.data = this.createArray(max, null);
    }

    // HELPER FUNCTIONS
    private createArray(len: number, itm: any) {
        var arr1 = [itm],
            arr2: any[] = [];
        while (len > 0) {
            if (len & 1) arr2 = arr2.concat(arr1);
            arr1 = arr1.concat(arr1);
            len >>>= 1;
        }
        return arr2
    }

    update(state: State): void {
        if (state == State.program) {
            this.data[this.fix_def.r-1] = 255
            this.fix_def.g ? this.data[this.fix_def.g-1] = 0 : null;
            this.fix_def.i ? this.data[this.fix_def.i-1] = 255 : null;
            this.notifyObserver()
        } else if (state == State.preview) {
            this.data[this.fix_def.r-1] = 0
            this.fix_def.g ? this.data[this.fix_def.g-1] = 255 : null;
            this.fix_def.i ? this.data[this.fix_def.i-1] = 255 : null;
            this.notifyObserver()
        } else {
            this.data[this.fix_def.r-1] = 0
            this.fix_def.g ? this.data[this.fix_def.g-1] = 0 : null;
            this.fix_def.i ? this.data[this.fix_def.i-1] = 255 : null;
            this.notifyObserver()
        }
        //console.log(`Tally ${this.camera.port} set to ${state}.`)
    }

    notifyObserver() {
        this.observer.update({
            startDmx: this.startDmx,
            data: this.data
        })
    }
}