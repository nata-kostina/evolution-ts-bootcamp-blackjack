import { UIStore } from "../stores/UIstore";
import { Action, Bet } from "../types/game.types";
import { IBetCanvasElement } from "../types/canvas.types";

export class Controller {
    private readonly uiStore: UIStore;
    public constructor(uiStore: UIStore) {
        this.uiStore = uiStore;
    }

    public addBet({ value }: { value: Bet; id: string; }): void {
        this.uiStore.addBet({ value });
        this.uiStore.toggleBetEditBtnsDisabled(false);
        if (this.uiStore.isPlayerActionBtnDisabled(Action.BET)) {
            this.uiStore.togglePlaceBetBtnDisabled(false);
        }
    }

    public setBetElement(betElement: IBetCanvasElement): void {
        this.uiStore.betElement = betElement;
    }
}
