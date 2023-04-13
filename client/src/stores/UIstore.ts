/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from "mobx";
import { Action, AvailableActions, Bet, PlayerInstance } from "../types/game.types";
import { Notification } from "../types/notification.types";
import { IBetCanvasElement } from "../types/canvas.types";

export class UIStore {
    private _player: PlayerInstance | null = null;
    private _actionBtnsDisabled: Record<Action, boolean> = {
        hit: true,
        stand: true,
        double: true,
        surender: true,
        insurance: true,
        bet: true,
        split: true,
    };

    private _betEditBtnsDisabled = true;
    private _betHistory: Array<number> = [];

    private _helperTarget: Array<Action> = [];

    private _currentModal: Notification | null = null;
    private _modalQueue: Array<Notification> = [];
    private _isModalShown = false;

    private _betElement: IBetCanvasElement | null = null;

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

    public set betElement(element: IBetCanvasElement) {
        this._betElement = element;
    }

    public isPlayerActionBtnDisabled(btn: Action): boolean {
        return this._actionBtnsDisabled[btn];
    }

    public isBetEditBtnDisabled(): boolean {
        return this._betEditBtnsDisabled;
    }

    public togglePlaceBetBtnDisabled(value: boolean): void {
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

    public addBet({ value }: { value: Bet; }): void {
        try {
            if (this.player && value <= this.player.balance) {
                this.player.bet += value;
                this.player.balance -= value;
                this._betHistory.push(value);
                if (this._betElement) {
                    this._betElement.addChip(value);
                    this._betElement.updateBet(this.player.bet);
                }
            }
        } catch (error) {
            console.log("Failed to add bet");
        }
    }

    public undoBet(): void {
        try {
            if (this.player) {
                const lastBet = this._betHistory.pop();
                if (lastBet) {
                    this.player.bet -= lastBet;
                    this.player.balance += lastBet;
                }
                if (this.player.bet === 0) {
                    this.toggleBetEditBtnsDisabled(true);
                }
                if (this._betElement) {
                    this._betElement.removeChip();
                    this._betElement.updateBet(this.player.bet);
                }
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

    public resetBetHistory(): void {
        this._betHistory = [];
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
