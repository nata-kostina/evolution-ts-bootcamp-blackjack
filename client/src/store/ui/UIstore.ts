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
    BetAction,
    ModalUnion,
    NotificationKind,
    NotificationVariant,
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
        bet: false,
    };

    private betEditBtnsDisabled = true;
    private betHistory: number[] = [];

    private errorHandler: ErrorHandler = new ErrorHandler();
    private notification: UINotification = new UINotification();
    private _helperTarget: Action | null = null;

    public constructor() {
        makeAutoObservable(this);
    }

    public togglePlaceBetBtnDisabled(value: boolean): void {
        console.log("togglePlaceBetBtnDisabled");
        this.actionBtnsDisabled.bet = value;
    }

    public toggleBetEditBtnsDisabled(value: boolean): void {
        this.betEditBtnsDisabled = value;
    }

    public setPlayer(player: PlayerInstance): void {
        this.player = player;
    }

    public getPlayer(): PlayerInstance | null {
        return this.player;
    }

    public getBet(): Bet | null {
        if (this.player) {
            return this.player.bet;
        }
        return null;
    }

    public setDealer(dealer: DealerInstance): void {
        this.dealer = dealer;
    }

    public isPlayerActionBtnDisabled(btn: Action): boolean {
        return this.actionBtnsDisabled[btn];
    }

    public isBetEditBtnDisabled(): boolean {
        return this.betEditBtnsDisabled;
    }

    public addBet(bet: number): void {
        console.log("add bet: ", bet);
        try {
            if (this.player) {
                console.log("this.player: ", toJS(this.player));
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
        console.log("clearBets history: ", toJS(this.betHistory));
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

    public addNotificationModal(modal: ModalUnion): void {
        this.notification.add(modal);
    }

    public getCurrentModal(): ModalUnion | null {
        return this.notification.getCurrentModal();
    }

    public isModalShown(): boolean {
        return this.notification.isModalShown();
    }

    public getModalQueue(): Array<ModalUnion> {
        return this.notification.getModalQueue();
    }

    public showNotification(): void {
        this.notification.showNotification();
    }

    public hideNotification(): void {
        this.notification.hideNotification();
    }

    public addHelper(action: Action): void {
        this._helperTarget = action;
    }

    public get helperTarget(): Action | null {
        return this._helperTarget;
    }

    public resetHelperTarget(): void {
        this._helperTarget = null;
    }
}
