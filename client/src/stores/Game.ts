/* eslint-disable no-empty */
import { makeAutoObservable } from "mobx";
import { ValidationError } from "yup";
import { UIStore } from "./UIstore";
import { pickPlayerInstance } from "../utils/storeUtils/pickPlayerInsrance";
import { SceneCanvasElement } from "../canvas/canvasElements/Scene.canvas.element";
import { UnholeCardPayload } from "../types/canvas.types";
import { GameSession, PlayerID, RoomID, NewCard, Action } from "../types/game.types";
import { Notification, NotificationVariant } from "../types/notification.types";
import { SocketResponse } from "../types/socket.types";
import {
    gameSessionSchema,
    newCardSchema,
    notificationSchema,
    playerSchema,
    unholedCardSchema,
} from "../utils/validation/schemas";

export class Game {
    private readonly _ui: UIStore;
    private readonly _scene: SceneCanvasElement;

    private _session: GameSession | null = null;
    private _playerID: PlayerID | null = null;
    private _roomID: RoomID | null = null;

    public constructor(ui: UIStore, scene: SceneCanvasElement) {
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

    public async handleStartGame(response: SocketResponse<GameSession>): Promise<void> {
        try {
            if (response.ok && response.payload && this._playerID) {
                const session = await gameSessionSchema.validate(response.payload);
                const player = pickPlayerInstance({ playerID: this._playerID, players: session.players });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player, {
                        stripUnknown: true,
                    });
                    this._session = session;
                    this._roomID = session.roomID;
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(player.availableActions);
                    this._scene.toggleChipAction(true);
                }
            } else {
            }
        } catch (error) {
            if (error instanceof ValidationError) {
                console.log("The response data is invalid");
                return;
            }
            console.log("Uncaught error occured");
        }
    }

    public async handleUpdateGameSession(response: SocketResponse<GameSession>): Promise<void> {
        try {
            if (response.ok && response.payload && this._playerID) {
                const session = await gameSessionSchema.validate(response.payload);
                const player = pickPlayerInstance({ playerID: this._playerID, players: session.players });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player, {
                        stripUnknown: true,
                    });
                    this._session = session;
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(player.availableActions);
                }
            } else {
            }
        } catch (error) {

        }
    }

    public async handlePlaceBetNotification(response: SocketResponse<GameSession>): Promise<void> {
        try {
            if (response.ok && response.payload && this._playerID) {
                const session = await gameSessionSchema.validate(response.payload);

                const player = pickPlayerInstance({ playerID: this._playerID, players: session.players });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player, {
                        stripUnknown: true,
                    });
                    this._session = session;
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(validatedPlayer.availableActions);
                    this._ui.togglePlaceBetBtnDisabled(true);
                    this._ui.toggleBetEditBtnsDisabled(true);
                    this._scene.toggleChipAction(false);
                }
            } else {
            }
        } catch (error) {

        }
    }

    public async handleNotificate(response: SocketResponse<Notification>): Promise<void> {
        try {
            if (response.ok && response.payload) {
                const notification = await notificationSchema.validate(response.payload);
                switch (notification.variant) {
                    case NotificationVariant.Blackjack:
                        this._scene.addBlackjackNotification();
                        break;
                    case NotificationVariant.StandOrTakeMoney:
                        this._ui.addModal(notification);
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
        } catch (error) {

        }
    }

    public async handleFinishRound(response: SocketResponse<GameSession>): Promise<void> {
        try {
            if (response.ok && response.payload && this._playerID) {
                const session = await gameSessionSchema.validate(response.payload);
                const player = pickPlayerInstance({ playerID: this._playerID, players: session.players });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player, {
                        stripUnknown: true,
                    });
                    this._session = session;
                    this._ui.resetBet();
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(validatedPlayer.availableActions);
                    this._ui.resetHelperTarget();
                    this._scene.toggleChipAction(true);
                    this._scene.removeCards();
                }
            } else {
            }
        } catch (error) {

        }
    }

    public async handleDealCard(response: SocketResponse<NewCard>): Promise<void> {
        console.log("handleDealCard");
        try {
            if (response.ok && response.payload) {
                const newCard = await newCardSchema.validate(response.payload);
                if (newCard.target === "player") {
                    await this._scene.dealPlayerCard(newCard);
                } else {
                    await this._scene.dealDealerCard(newCard);
                }
            } else {
            }
        } catch (error) {

        }
    }

    public async handleUnholeCard(response: SocketResponse<UnholeCardPayload>): Promise<void> {
        try {
            if (response.ok && response.payload) {
                const unholedCard = await unholedCardSchema.validate(response.payload);
                this._scene.unholeCard(unholedCard);
            } else {
            }
        } catch (error) {

        }
    }
}
