export interface Observer<T> {
    update(data: T): void
}