import { makeAutoObservable } from "mobx";
import { Action, AvailableActions, Bet, PlayerInstance } from "../types/game.types";
import { Notification } from "../types/notification.types";

export class UIStore {
    private _player: PlayerInstance | null = null;
    private _actionBtnsDisabled: Record<Action, boolean> = {
        hit: true,
        stand: true,
        double: true,
        surender: true,
        insurance: true,
        bet: false,
    };

    private _betEditBtnsDisabled = true;
    private _betHistory: Array<number> = [];

    private _helperTarget: Array<Action> = [];

    private _currentModal: Notification | null = null;
    private _modalQueue: Array<Notification> = [];
    private _isModalShown = false;

    public constructor() {
        makeAutoObservable(this);
    }

    public set player(player: PlayerInstance | null) {
        this._player = player;
    }

    public get player(): PlayerInstance | null {
        return this._player;
    }

    public get bet(): Bet | null {
        if (this.player) {
            return this.player.bet;
        }
        return null;
    }

    public get modalQueue(): Array<Notification> {
        return this._modalQueue;
    }

    public get helper(): Array<Action> {
        return this._helperTarget;
    }

    public get currentModal(): Notification | null {
        return this._currentModal;
    }

    public get isModalShown(): boolean {
        return this._isModalShown;
    }

    public isPlayerActionBtnDisabled(btn: Action): boolean {
        return this._actionBtnsDisabled[btn];
    }

    public isBetEditBtnDisabled(): boolean {
        return this._betEditBtnsDisabled;
    }

    public togglePlaceBetBtnDisabled(value: boolean): void {
        console.log("togglePlaceBetBtnDisabled");
        this._actionBtnsDisabled.bet = value;
    }

    public toggleBetEditBtnsDisabled(value: boolean): void {
        this._betEditBtnsDisabled = value;
    }

    public toggleActionBtns(enabled: AvailableActions): void {
        Object.keys(this._actionBtnsDisabled).forEach((btn) => {
            if (enabled.includes(btn as Action)) {
                this._actionBtnsDisabled[btn as Action] = false;
            } else {
                this._actionBtnsDisabled[btn as Action] = true;
            }
        });
    }

    public addBet(bet: Bet): void {
        console.log("add bet: ", bet);
        try {
            if (this.player) {
                this.player.bet += bet;
                this.player.balance -= bet;
                this._betHistory.push(bet);
            }
        } catch (error) {
            console.log("Failed to add bet");
        }
    }

    public undoBet(): void {
        try {
            const lastBet = this._betHistory.pop();
            if (lastBet && this.player) {
                this.player.bet -= lastBet;
                this.player.balance += lastBet;
            }
        } catch (error) {
            console.log("Failed to undo bet");
        }
    }

    public resetBet(): void {
        while (this._betHistory.length > 0) {
            this.undoBet();
        }
    }

    public addHelper(action: Action): void {
        this._helperTarget.push(action);
    }

    public resetHelperTarget(): void {
        this._helperTarget = [];
    }

    public addModal(notification: Notification): void {
        this._modalQueue = [...this._modalQueue, notification];
    }

    public resetModalQueue(): void {
        this._modalQueue = [];
    }

    public showModal(): void {
        if (!this._isModalShown) {
            this._currentModal = this._modalQueue[0];
            this._isModalShown = true;
        }
    }

    public hideNotification(): void {
        this._isModalShown = false;
        this._currentModal = null;
        this._modalQueue = this._modalQueue.slice(1);
    }
}
