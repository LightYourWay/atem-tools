import { Observer } from "./Observer";

export interface Subject<T> {
    registerObserver(o: Observer<T>): void
    removeObserver(o: Observer<T>): void
    notifyObservers(): void
}