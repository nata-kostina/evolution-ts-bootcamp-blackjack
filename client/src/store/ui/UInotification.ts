import { makeAutoObservable } from "mobx";
import { ModalUnion } from "../../types/types";

export class UINotification {
    private currentModal: ModalUnion | null = null;
    private queue: Array<ModalUnion> = [];
    private isShown = false;

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

    public getCurrentModal(): ModalUnion | null {
        return this.currentModal;
    }

    public isModalShown(): boolean {
        return this.isShown;
    }

    public getModalQueue(): Array<ModalUnion> {
        return this.queue;
    }
}
