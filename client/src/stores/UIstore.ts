import { makeAutoObservable } from "mobx";
import {
    Action,
    AvailableActions,
    BetAction,
    PlayerInstance,
} from "../types/game.types";
import { Notification } from "../types/notification.types";
import { IBetCanvasElement } from "../types/canvas.types";
import { UiActionBtn } from "../types/ui.types";
import { splitAmountIntoChipsValues } from "../utils/gameUtils/splitAmountIntoChipsValues";

export class UIStore {
    private _player: PlayerInstance | null = null;
    private _actionBtnsState: Record<
    Action | BetAction,
    UiActionBtn
  > = {
            [Action.Hit]: {
                isVisible: false,
                isDisabled: true,
                type: "playerAction",
            },
            [Action.Stand]: {
                isVisible: false,
                isDisabled: true,
                type: "playerAction",
            },
            [Action.Double]: {
                isVisible: false,
                isDisabled: true,
                type: "playerAction",
            },
            [Action.Surender]: {
                isVisible: false,
                isDisabled: true,
                type: "playerAction",
            },
            [Action.Insurance]: {
                isVisible: false,
                isDisabled: true,
                type: "playerAction",
            },
            [Action.Bet]: {
                isVisible: true,
                isDisabled: true,
                type: "betAction",
            },
            [Action.Split]: {
                isVisible: false,
                isDisabled: true,
                type: "playerAction",
            },
            [BetAction.Reset]: {
                isVisible: true,
                isDisabled: true,
                type: "betAction",
            },
            [BetAction.Undo]: {
                isVisible: true,
                isDisabled: true,
                type: "betAction",
            },
            [BetAction.Rebet]: {
                isVisible: true,
                isDisabled: true,
                type: "betAction",
            },
            [BetAction.AllIn]: {
                isVisible: true,
                isDisabled: true,
                type: "betAction",
            },
        };

    private _betHistory: Array<number> = [];
    private _lastBetHistory: Array<number> = [];
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

    public get bet(): number | null {
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

    public toggleEditBetBtnsVisible(value: boolean): void {
        this._actionBtnsState[Action.Bet].isVisible = value;
        this._actionBtnsState[BetAction.Undo].isVisible = value;
        this._actionBtnsState[BetAction.Reset].isVisible = value;
        this._actionBtnsState[BetAction.Rebet].isVisible = value;
        this._actionBtnsState[BetAction.AllIn].isVisible = value;
    }

    public initEditBetBtns(): void {
        this.toggleEditBetBtnsVisible(true);
        this._actionBtnsState[Action.Bet].isDisabled = true;
        this._actionBtnsState[BetAction.Undo].isDisabled = true;
        this._actionBtnsState[BetAction.Reset].isDisabled = true;
        this._actionBtnsState[BetAction.Rebet].isDisabled = !(this._lastBetHistory.length > 0);
        this._actionBtnsState[BetAction.AllIn].isDisabled = false;
    }

    public toggleActionBtnsVisible(enabled: AvailableActions): void {
        Object.keys(this._actionBtnsState).forEach((btn) => {
            const button = this._actionBtnsState[btn as keyof typeof this._actionBtnsState];
            const isIncluded = enabled.includes(btn as Action);
            if (button.type === "playerAction") {
                button.isVisible = isIncluded;
            } else if (btn === Action.Bet) {
                this._actionBtnsState[Action.Bet].isVisible = isIncluded;
                if (isIncluded) {
                    this.initEditBetBtns();
                } else {
                    this.toggleEditBetBtnsVisible(false);
                }
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

    public addBet(value: number): void {
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
        this._lastBetHistory = this._betHistory;
        this._betHistory = [];
    }

    public rebet(): void {
        this._lastBetHistory.forEach((bet) => this.addBet(bet));
    }

    public allIn(): void {
        if (this.player) {
            const chipsValues = splitAmountIntoChipsValues(this.player.balance);
            chipsValues.forEach((item) => {
                for (let i = 0; i < item.amount; i++) {
                    this.addBet(item.chipValue);
                }
            });
            const cents = this.player.balance;
            if (cents > 0) {
                this._betHistory.push(cents);
                this.player.bet += cents;
                this.player.balance = 0;
                this._betElement?.updateBet(this.player.bet);
            }
        }
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
