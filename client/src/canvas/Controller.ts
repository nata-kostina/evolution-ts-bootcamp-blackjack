import { UIStore } from "../store/ui/UIstore";
import { Action, Bet } from "../types/types";

export class Controller {
    private readonly uiStore: UIStore;
    public constructor(uiStore: UIStore) {
        this.uiStore = uiStore;
    }

    public addBet(bet: Bet): void {
        this.uiStore.addBet(bet);
        this.uiStore.toggleBetEditBtnsDisabled(false);
        if (this.uiStore.isPlayerActionBtnDisabled(Action.BET)) {
            this.uiStore.togglePlaceBetBtnDisabled(false);
        }
    }
}
