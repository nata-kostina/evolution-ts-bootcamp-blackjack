/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-empty */
import { makeAutoObservable } from "mobx";
import { ValidationError } from "yup";
import { UIStore } from "./UIstore";
import { pickPlayerInstance } from "../utils/storeUtils/pickPlayerInsrance";
import { SceneManager } from "../canvas/canvasElements/SceneManager";
import { UnholeCardPayload } from "../types/canvas.types";
import {
    GameSession,
    PlayerID,
    RoomID,
    Action,
    DealDealerCard,
    DealPlayerCard,
} from "../types/game.types";
import { Notification, NotificationVariant } from "../types/notification.types";
import { FinishRoundForHand, ReassignActiveHand, SocketResponse } from "../types/socket.types";
import {
    gameResultSchema,
    gameSessionSchema,
    handIDSchema,
    handSchema,
    newCardSchema,
    notificationSchema,
    playerIDSchema,
    playerSchema,
    unholedCardSchema,
} from "../utils/validation/schemas";

export class Game {
    private readonly _ui: UIStore;
    private readonly _scene: SceneManager;

    private _session: GameSession | null = null;
    private _playerID: PlayerID | null = null;
    private _roomID: RoomID | null = null;

    public constructor(ui: UIStore, scene: SceneManager) {
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

    public get scene(): SceneManager {
        return this._scene;
    }

    public async handleInitGame(
        response: SocketResponse<{ game: GameSession; playerID: PlayerID; }>,
    ): Promise<void> {
        try {
            if (response.ok && response.payload) {
                console.log("handleInitGame: ", response.payload);
                const session = await gameSessionSchema.validate(response.payload.game);
                const id = await playerIDSchema.validate(response.payload.playerID);
                this.playerID = id;

                const player = pickPlayerInstance({
                    playerID: id,
                    players: session.players,
                });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player);
                    const validatedActiveHand = await handSchema.validate(
                        validatedPlayer.hands.find(
                            (hand) => hand.handID === player.activeHandID,
                        ),
                    );
                    localStorage.setItem("player_id", validatedPlayer.playerID);

                    this._session = session;
                    this._roomID = session.roomID;
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(validatedPlayer.availableActions);
                    this._scene.init(validatedActiveHand.handID);
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

    public async handleUpdateGameSession(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        try {
            console.log("handleUpdateGameSession: ", response.payload);
            if (response.ok && response.payload && this._playerID) {
                const session = await gameSessionSchema.validate(response.payload);
                const player = pickPlayerInstance({
                    playerID: this._playerID,
                    players: session.players,
                });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player);
                    this._session = session;
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(validatedPlayer.availableActions);
                }
            } else {
            }
        } catch (error) {}
    }

    public async handlePlaceBet(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        try {
            if (response.ok && response.payload && this._playerID) {
                console.log("handlePlaceBet: ", response.payload);
                const session = await gameSessionSchema.validate(response.payload);

                const player = pickPlayerInstance({
                    playerID: this._playerID,
                    players: session.players,
                });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player);
                    const validatedActiveHand = await handSchema.validate(
                        validatedPlayer.hands.find(
                            (hand) => hand.handID === player.activeHandID,
                        ),
                    );
                    this._session = session;
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(validatedPlayer.availableActions);
                    this._ui.togglePlaceBetBtnDisabled(true);
                    this._ui.toggleBetEditBtnsDisabled(true);
                    this._scene.toggleChipAction(false);
                }
            } else {
            }
        } catch (error) {}
    }

    public async handleNotificate(
        response: SocketResponse<Notification>,
    ): Promise<void> {
        try {
            console.log("handleNotificate: ", response.payload);
            if (response.ok && response.payload) {
                const notification = await notificationSchema.validate(
                    response.payload,
                );
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
        } catch (error) {}
    }

    public async handleFinishRound(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        try {
            console.log("handleFinishRound: ", response.payload);

            if (response.ok && response.payload && this._playerID) {
                const session = await gameSessionSchema.validate(response.payload);
                const player = pickPlayerInstance({ playerID: this._playerID, players: session.players });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player, {
                        stripUnknown: true,
                    });
                    this._session = session;
                    this._ui.resetBetHistory();
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(validatedPlayer.availableActions);
                    this._scene.resetScene();
                }
            } else {
            }
        } catch (error) {
            if (error instanceof ValidationError) {
                console.log("The response data is invalid", error);
                return;
            }
            console.log("Uncaught error occured");
        }
    }

    public async handleDealDealerCard(
        response: SocketResponse<DealDealerCard>,
    ): Promise<void> {
        try {
            if (response.ok && response.payload) {
                // const newCard = await newCardSchema.validate(response.payload);
                await this._scene.dealDealerCard(response.payload);
            } else {
            }
        } catch (error) {}
    }

    public async handleDealPlayerCard(
        response: SocketResponse<DealPlayerCard>,
    ): Promise<void> {
        try {
            if (response.ok && response.payload) {
                await this._scene.dealPlayerCard(response.payload);
            } else {
            }
        } catch (error) {}
    }

    public async handleUnholeCard(
        response: SocketResponse<UnholeCardPayload>,
    ): Promise<void> {
        try {
            if (response.ok && response.payload) {
                const unholedCard = await unholedCardSchema.validate(response.payload);
                await this._scene.unholeCard(unholedCard);
            }
        } catch (error) { }
    }

    public async handleSplit(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        try {
            if (response.ok && response.payload && this._playerID) {
                console.log("handleSplit: ", response.payload);
                const session = await gameSessionSchema.validate(response.payload);

                const player = pickPlayerInstance({
                    playerID: this._playerID,
                    players: session.players,
                });
                if (player) {
                    const validatedPlayer = await playerSchema.validate(player);
                    const validatedActiveHand = await handSchema.validate(
                        validatedPlayer.hands.find(
                            (hand) => hand.handID === player.activeHandID,
                        ),
                    );
                    const newHand = validatedPlayer.hands.find(
                        (hand) =>
                            hand.parentID === validatedActiveHand.handID,
                    );
                    if (!newHand) {
                        return;
                    }
                    this._session = session;
                    this._ui.player = validatedPlayer;
                    this._ui.toggleActionBtns(validatedPlayer.availableActions);
                    await this._scene.split({
                        oldHandID: validatedActiveHand.handID,
                        newHandID: newHand.handID,
                        bet: validatedActiveHand.bet,
                        points: validatedActiveHand.points,
                    });
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

    public async handleFinishRoundForHand(
        response: SocketResponse<FinishRoundForHand>,
    ): Promise<void> {
        try {
            if (response.ok && response.payload && this._playerID) {
                console.log("handleFinishRoundForHand: ", response.payload);
                const validatedHandID = await handIDSchema.validate(
                    response.payload.handID,
                );
                const validatedGameResult = await gameResultSchema.validate(
                    response.payload.result,
                );
                await this._scene.removeHand(validatedHandID, validatedGameResult);
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

    public async handleReassignActiveHand(response: SocketResponse<ReassignActiveHand>): Promise<void> {
        try {
            console.log("handleReassignActiveHand: ", response.payload);
            if (response.ok && response.payload) {
                const validatedId = await handIDSchema.validate(response.payload.handID);
                this._scene.updateHelper({ handId: validatedId });
                await new Promise<void>((resolve) => {
                    setTimeout(() => resolve(), 3000);
                });
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
}
