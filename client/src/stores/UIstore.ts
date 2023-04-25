import { makeAutoObservable } from "mobx";
import {
    Action,
    AvailableActions,
    Bet,
    BetAction,
    PlayerInstance,
} from "../types/game.types";
import { Notification } from "../types/notification.types";
import { IBetCanvasElement } from "../types/canvas.types";

export class UIStore {
    private _player: PlayerInstance | null = null;
    private _actionBtnsState: Record<
    Action | BetAction,
    { isVisible: boolean; isDisabled: boolean; }
  > = {
            [Action.Hit]: {
                isVisible: false,
                isDisabled: true,
            },
            [Action.Stand]: {
                isVisible: false,
                isDisabled: true,
            },
            [Action.Double]: {
                isVisible: false,
                isDisabled: true,
            },
            [Action.Surender]: {
                isVisible: false,
                isDisabled: true,
            },
            [Action.Insurance]: {
                isVisible: false,
                isDisabled: true,
            },
            [Action.Bet]: {
                isVisible: true,
                isDisabled: true,
            },
            [Action.Split]: {
                isVisible: false,
                isDisabled: true,
            },
            reset: {
                isVisible: true,
                isDisabled: true,
            },
            undo: {
                isVisible: true,
                isDisabled: true,
            },
        };

    private _betHistory: Array<number> = [];
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

    public get currentModal(): Notification | null {
        return this._currentModal;
    }

    public get isModalShown(): boolean {
        return this._isModalShown;
    }

    public set isModalShown(value: boolean) {
        this._isModalShown = value;
    }

    public set betElement(element: IBetCanvasElement) {
        this._betElement = element;
    }

    public getPlayerActionBtnState(btn: Action | BetAction): {
        isDisabled: boolean;
        isVisible: boolean;
    } {
        return this._actionBtnsState[btn];
    }

    public togglePlayerActionsBtnsDisabled(value: boolean): void {
        Object.values(this._actionBtnsState).forEach((btn) => {
            btn.isDisabled = value;
        });
    }

    public toggleActionBtnsVisible(enabled: AvailableActions): void {
        Object.keys(this._actionBtnsState).forEach((btn) => {
            if (btn === Action.Bet) {
                this._actionBtnsState.Bet.isVisible = enabled.includes(Action.Bet);
            } else if (btn === BetAction.Reset || btn === BetAction.Undo) {
                this._actionBtnsState.undo.isVisible = enabled.includes(Action.Bet);
                this._actionBtnsState.reset.isVisible = enabled.includes(Action.Bet);
            } else {
                this._actionBtnsState[btn as Action].isVisible = enabled.includes(
                    btn as Action,
                );
            }
        });
    }

    public toggleVisibleActionBtnsDisabled(value: boolean): void {
        Object.values(this._actionBtnsState).forEach((btn) => {
            if (btn.isVisible) {
                btn.isDisabled = value;
            }
        });
    }

    public addBet({ value }: { value: Bet; }): void {
        try {
            if (this.player && value <= this.player.balance) {
                this.player.bet += value;
                this.player.balance -= value;
                this._betHistory.push(value);
                this.togglePlaceBetBtnDisabled(false);
                this.toggleBetEditBtnsDisabled(false);
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
                    this.togglePlaceBetBtnDisabled(true);
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

    private togglePlaceBetBtnDisabled(value: boolean): void {
        this._actionBtnsState.Bet.isDisabled = value;
    }

    private toggleBetEditBtnsDisabled(value: boolean): void {
        this._actionBtnsState.undo.isDisabled = value;
        this._actionBtnsState.reset.isDisabled = value;
    }
}
