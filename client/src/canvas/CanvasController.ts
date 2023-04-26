import { UIStore } from "../stores/UIstore";
import { IBetCanvasElement } from "../types/canvas.types";

export class CanvasController {
    private readonly uiStore: UIStore;

    public constructor(uiStore: UIStore) {
        this.uiStore = uiStore;
    }

    public addBet(value: number): void {
        this.uiStore.addBet(value);
    }

    public setBetElement(betElement: IBetCanvasElement): void {
        this.uiStore.betElement = betElement;
    }
}
