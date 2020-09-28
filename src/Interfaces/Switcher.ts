import { NetworkDevice } from "./NetworkDevice";

export interface Switcher extends NetworkDevice {
    typeName: string
    preview: number[]
    program: number[]
}