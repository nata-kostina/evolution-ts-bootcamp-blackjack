/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from "mobx";
import { UIStore } from "./UIstore";
import { CanvasBase } from "../canvas/CanvasBase";
import { pickPlayerInstance } from "../utils/storeUtils/pickPlayerInsrance";
import { SceneCanvasElement } from "../canvas/canvasElements/Scene.canvas.element";
import { UnholeCardPayload } from "../types/canvas.types";
import { GameSession, PlayerID, RoomID, NewCard, Action } from "../types/game.types";
import { Notification, NotificationVariant } from "../types/notification.types";
import { SocketResponse } from "../types/socket.types";

export class Game {
    private readonly _ui: UIStore;
    private readonly _canvas: CanvasBase;
    private readonly _scene: SceneCanvasElement;

    private _session: GameSession | null = null;
    private _playerID: PlayerID | null = null;
    private _roomID: RoomID | null = null;

    public constructor(canvas: CanvasBase, ui: UIStore, scene: SceneCanvasElement) {
        this._canvas = canvas;
        this._scene = scene;
        this._ui = ui;
        makeAutoObservable(this);
    }

    public get UI(): UIStore {
        return this._ui;
    }

    public set playerID(connectionID: string | null) {
        this._playerID = connectionID;
    }

    public get playerID(): string | null {
        return this._playerID;
    }

    public set roomID(roomID: RoomID | null) {
        this._roomID = roomID;
    }

    public get roomID(): RoomID | null {
        return this._roomID;
    }

    public finishGame(): void {
        if (this._roomID && this._playerID) {
            // this._ui.notification.resetQueue();
            // this.connection.socket.emit("finishGame", { roomID: this._roomID, playerID: this._playerID });
        }
    }

    public handleStartGame(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload && this._playerID) {
            const player = pickPlayerInstance({ playerID: this._playerID, players: response.payload.players });
            if (player) {
                this._session = response.payload;
                this._roomID = response.payload.roomID;
                this._ui.dealer = response.payload.dealer;
                this._ui.player = player;
                this._ui.toggleActionBtns(player.availableActions);
                this._scene.toggleChipAction(true);
            }
        } else {
        }
    }

    public handleUpdateGameSession(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload && this._playerID) {
            const player = pickPlayerInstance({ playerID: this._playerID, players: response.payload.players });
            if (player) {
                this._session = response.payload;
                this._ui.dealer = response.payload.dealer;
                this._ui.player = player;
                this._ui.toggleActionBtns(player.availableActions);
            }
        } else {
        }
    }

    public handlePlaceBetNotification(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload && this._playerID) {
            const player = pickPlayerInstance({ playerID: this._playerID, players: response.payload.players });
            if (player) {
                this._session = response.payload;
                this._ui.dealer = response.payload.dealer;
                this._ui.player = player;
                this._ui.toggleActionBtns(player.availableActions);
                this._ui.togglePlaceBetBtnDisabled(true);
                this._ui.toggleBetEditBtnsDisabled(true);
                this._scene.toggleChipAction(false);
            }
        } else {
        }
    }

    public handleNotificate(response: SocketResponse<Notification>): void {
        if (response.ok) {
            switch (response.payload.variant) {
                case NotificationVariant.Blackjack:
                    this._scene.addBlackjackNotification();
                    break;
                case NotificationVariant.StandOrTakeMoney:
                    this._ui.addModal(response.payload);
                    break;
                case NotificationVariant.Insurance:
                    this._ui.addHelper(Action.INSURANCE);
                    break;
                case NotificationVariant.Double:
                    this._ui.addHelper(Action.DOUBLE);
                    break;
                default:
                    break;
            }
        } else {
        }
    }

    public handleFinishRound(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload && this._playerID) {
            const player = pickPlayerInstance({ playerID: this._playerID, players: response.payload.players });
            if (player) {
                this._session = response.payload;
                this._ui.resetBet();
                this._ui.dealer = response.payload.dealer;
                this._ui.player = player;
                this._ui.toggleActionBtns(player.availableActions);
                this._ui.resetHelperTarget();
                this._scene.toggleChipAction(true);
                this._scene.removeCards();
            }
        } else {
        }
    }

    public handleDealCard(response: SocketResponse<NewCard>): void {
        if (response.ok && response.payload) {
            if (response.payload.target === "player") {
                this._scene.dealPlayerCard(response.payload);
            } else {
                this._scene.dealDealerCard(response.payload);
            }
        } else {
        }
    }

    public handleUnholeCard(response: SocketResponse<UnholeCardPayload>): void {
        if (response.ok && response.payload) {
            this._scene.unholeCard(response.payload);
        } else {
        }
    }
}
