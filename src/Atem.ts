// internal imports
import { Subject } from "./Interfaces/Subject"
import { Observer } from "./Interfaces/Observer"
import { Switcher } from "./Interfaces/Switcher"
import { Input } from "./Interfaces/Input"
import { State } from "./Interfaces/State"

// external imports
import { Atem as AtemSwitcher, AtemState } from "atem-connection"
import _ from "lodash"

/** Class representing an Atem Switcher. */
export class Atem implements Subject<State>, Switcher {

    private observers: Observer<State>[] & Input[] = []
    private switcher: AtemSwitcher = new AtemSwitcher()
    private old_preview: number[] = []
    private old_program: number[] = []
    private new_preview: number[] = []
    private new_program: number[] = []

    ip: string
    typeName: string = "BMD Atem Switcher"
    preview: number[] = []
    program: number[] = []

    constructor (ip: string) {
        this.ip = ip

        this.connect()

        this.switcher.on('connected', () => {

            if (this.switcher.state?.info.productIdentifier) {
                this.typeName = this.switcher.state.info.productIdentifier
            }

            console.log(`Connected to ${this.typeName} on ${this.ip}.`)

            let update_now: boolean = true
            update_now = this.parseNewState(update_now)

            this.switcher.on('stateChanged', (state: AtemState) => {
                update_now = this.parseNewState(update_now)
            });

        })

        this.switcher.on('disconnected', () => {
            console.log(`Disconnected from ${this.typeName} on ${this.ip}.`)
            this.connect()
        })

    }

    parseNewState(update_now: boolean):boolean {

        //saving old preview and program information for later use
        this.old_preview = this.preview
        this.old_program = this.program
        
        // checking out current preview and program information
        this.new_preview = this.switcher.listVisibleInputs("preview", 0)
        this.new_program = this.switcher.listVisibleInputs("program", 0)
        
        // comparing to old preview information, updating if changed
        if (_.isEqual(this.preview, this.new_preview) == false) {
            this.preview = this.new_preview
            update_now = true
        }

        // comparing to old program information, updating if changed
        if (_.isEqual(this.program, this.new_program) == false) {
            this.program = this.new_program
            update_now = true
        }

        // notifing tallys ("Inputs") if there are changes
        if (update_now == true) {
            this.notifyObservers();
            update_now = false
        }

        // return update_now: boolean to track if
        // information has changed compared to previous state
        return update_now
    }

    connect(): void {
        console.log(`Connecting to ${this.ip}...`)
        this.switcher.connect(this.ip)
    }

    registerObserver(o: Observer<State> & Input): void {
        this.observers.push(o)
    }

    removeObserver(o: Observer<State> & Input): void {
        let index = this.observers.indexOf(o)
        this.observers.splice(index, 1)
    }

    notifyObservers(): void {
        for (let observer of this.observers) {

            let update_input = false

            if ( this.old_program.includes(observer.port) != this.new_program.includes(observer.port) ) {
                update_input = true
            }

            if ( this.old_preview.includes(observer.port) != this.new_preview.includes(observer.port) ) {
                update_input = true
            }

            if (update_input == true) {
                observer.update(this.program.includes(observer.port) ? State.program : this.preview.includes(observer.port) ? State.preview : State.off)
            }
        }
    }
}