import { UIStore } from "../stores/UIstore";
import { Bet } from "../types/game.types";
import { IBetCanvasElement } from "../types/canvas.types";

export class CanvasController {
    private readonly uiStore: UIStore;

    public constructor(uiStore: UIStore) {
        this.uiStore = uiStore;
    }

    public addBet({ value }: { value: Bet; id: string; }): void {
        this.uiStore.addBet({ value });
    }

    public setBetElement(betElement: IBetCanvasElement): void {
        this.uiStore.betElement = betElement;
    }
}
