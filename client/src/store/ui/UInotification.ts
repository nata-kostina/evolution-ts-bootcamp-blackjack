import { makeAutoObservable } from "mobx";
import { ModalUnion } from "../../types/types";

export class UINotification {
    public currentModal: ModalUnion | null = null;
    public queue: ModalUnion[] = [];
    public isShown = false;

    public constructor() {
        makeAutoObservable(this);
    }

    public add(modal: ModalUnion): void {
        this.queue = [...this.queue, modal];
    }

    public resetQueue(): void {
        this.queue = [];
    }

    public showNotification(): void {
        if (!this.isShown) {
            this.currentModal = this.queue[0];
            this.isShown = true;
        }
    }

    public hideNotification(): void {
        this.isShown = false;
        this.currentModal = null;
        this.queue = this.queue.slice(1);
    }
}
