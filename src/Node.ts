import { DMX } from "./Interfaces/DMX";
import { NetworkDevice } from "./Interfaces/NetworkDevice";
import { Observer } from "./Interfaces/Observer";
import { ArtNetSender } from "./Library/ArtNetSender";

export class Node implements Observer<DMX>, NetworkDevice {
    ip: string;
    ArtNetSender: ArtNetSender

    constructor (ip: string) {
        this.ip = ip
        this.ArtNetSender = new ArtNetSender(this.ip, 0, 0)
    }

    update(dmx: DMX): void {
        this.ArtNetSender.update(dmx)
        //console.log(`Tally ${this.camera.port} set to ${state}.`)
    }
}