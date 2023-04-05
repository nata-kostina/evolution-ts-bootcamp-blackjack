/* eslint-disable import/no-duplicates */
/* eslint-disable no-debugger */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable, toJS } from "mobx";
import {
    AvailableActions,
    Bet,
    DealerInstance,
    Action,
    GameSession,
    PlayerInstance,
} from "../../types/types";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { UINotification } from "./UInotification";

export class UIStore {
    private player: PlayerInstance | null = null;
    private dealer: DealerInstance | null = null;
    private actionBtnsDisabled: Record<Action, boolean> = {
        hit: true,
        stand: true,
        double: true,
        surender: true,
        insurance: true,
    };

    private betHistory: number[] = [];
    private placeBetBtnDisabled = true;
    private newBetDisabled = true;

    private errorHandler: ErrorHandler = new ErrorHandler();
    private notification: UINotification = new UINotification();

    private decisionHandler: ((decision: Action) => void) | null = null;
    private betHandler: ((bet: Bet) => void) | null = null;

    public constructor() {
        makeAutoObservable(this);
    }

    public togglePlaceBetBtn(value: boolean): void {
        this.placeBetBtnDisabled = value;
    }

    public toggleNewBetDisabled(value: boolean): void {
        this.newBetDisabled = value;
    }

    public setPlayer(player: PlayerInstance): void {
        this.player = player;
    }

    public getPlayer(): PlayerInstance | null {
        return this.player;
    }

    public setDealer(dealer: DealerInstance): void {
        this.dealer = dealer;
    }

    public addBet(bet: number): void {
        try {
            if (this.player) {
                this.player.bet += bet;
                this.player.balance -= bet;
                this.betHistory.push(bet);
            } else {
                this.errorHandler.setHandler({ execute: () => {} });
            }
        } catch (error) {
            console.log("Failed to add bet");
        }
    }

    public undoBet(): void {
        try {
            const lastBet = this.betHistory.pop();
            if (lastBet && this.player) {
                this.player.bet -= lastBet;
                this.player.balance += lastBet;
            }
        } catch (error) {
            console.log("Failed to undo bet");
        }
    }

    public clearBets(): void {
        while (this.betHistory.length > 0) {
            this.undoBet();
        }
    }

    public toggleActionBtns(enabled: AvailableActions): void {
        Object.keys(this.actionBtnsDisabled).forEach((btn) => {
            if (enabled.includes(btn as Action)) {
                this.actionBtnsDisabled[btn as Action] = false;
            } else {
                this.actionBtnsDisabled[btn as Action] = true;
            }
        });
    }
}
