import { makeAutoObservable } from "mobx";
import { UIStore } from "./UI.store";
import { pickPlayerInstance } from "../utils/store/pickPlayerInsrance";
import { SceneManager } from "../canvas/canvasElements/SceneManager";
import { UnholeCardPayload } from "../types/canvas.types";
import {
    GameSession,
    PlayerID,
    RoomID,
    DealDealerCard,
    DealPlayerCard,
    Action,
    Seat,
} from "../types/game.types";
import { Notification, NotificationVariant } from "../types/notification.types";
import { FinishRoundForHand, ReassignActiveHand, SocketResponse } from "../types/socket.types";
import {
    gameResultSchema,
    gameSessionSchema,
    handIDSchema,
    handSchema,
    notificationSchema,
    playerIDSchema,
    playerSchema,
    seatSchema,
    unholedCardSchema,
} from "../utils/validation/schemas";

export class Game {
    private readonly _ui: UIStore;
    private _scene: SceneManager | null = null;

    private _session: GameSession | null = null;
    private _playerID: PlayerID | null = null;
    private _roomID: RoomID | null = null;

    public constructor(ui: UIStore) {
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

    public get scene(): SceneManager | null {
        return this._scene;
    }

    public set scene(scene: SceneManager | null) {
        this._scene = scene;
    }

    public async handleInitGame(
        response: SocketResponse<{ game: GameSession; playerID: PlayerID; availableSeats: Array<Seat>; }>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            const session = await gameSessionSchema.validate(response.payload.game);
            const id = await playerIDSchema.validate(response.payload.playerID);
            const seats = await seatSchema.validate(response.payload.availableSeats);
            this.playerID = id;

            const player = pickPlayerInstance({
                playerID: id,
                players: session.players,
            });

            if (player) {
                const validatedPlayer = await playerSchema.validate(player);
                await handSchema.validate(
                    validatedPlayer.hands.find(
                            (hand) => hand.handID === player.activeHandID,
                    ),
                );

                localStorage.setItem("player_id", validatedPlayer.playerID);

                this._session = session;
                this._roomID = session.roomID;

                this._ui.player = validatedPlayer;

                this._scene?.init(seats);
            }
        });
    }

    public async handleUpdateGameSession(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            if (!this._playerID) {
                throw new Error("No player found");
            }

            const session = await gameSessionSchema.validate(response.payload);
            const player = pickPlayerInstance({
                playerID: this._playerID,
                players: session.players,
            });

            if (player) {
                const validatedPlayer = await playerSchema.validate(player);
                this._session = session;

                this._ui.player = validatedPlayer;
                this._ui.toggleActionBtnsVisible(validatedPlayer.availableActions);

                this._scene?.updateSession(player.playerID, session.players);
                this._scene?.toggleChipAction(validatedPlayer.availableActions.includes(Action.Bet));
            }
        });
    }

    public async handlePlaceBet(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            if (!this._playerID) {
                throw new Error("No player found");
            }

            const session = await gameSessionSchema.validate(response.payload);
            const player = pickPlayerInstance({
                playerID: this._playerID,
                players: session.players,
            });

            if (player) {
                const validatedPlayer = await playerSchema.validate(player);
                this._session = session;

                this._ui.player = validatedPlayer;
                this._ui.toggleVisibleActionBtnsDisabled(true);

                this._scene?.toggleChipAction(false);
            }
        });
    }

    public async handleNotificate(
        response: SocketResponse<Notification>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            const notification = await notificationSchema.validate(
                response.payload,
            );
            switch (notification.variant) {
                case NotificationVariant.PlaceBet:
                    if (this._ui.isModalShown) {
                        this._ui.isModalShown = false;
                        this._ui.modalQueue.pop();
                    }
                    this._ui.addModal(notification);
                    break;
                default:
                    this._ui.addModal(notification);
                    break;
            }
        });
    }

    public async handleFinishRound(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            if (!this._playerID) {
                throw new Error("No player found");
            }
            const session = await gameSessionSchema.validate(response.payload);
            const player = pickPlayerInstance({ playerID: this._playerID, players: session.players });
            if (player) {
                const validatedPlayer = await playerSchema.validate(player, {
                    stripUnknown: true,
                });
                this._session = session;

                this._ui.resetBetHistory();
                this._ui.player = validatedPlayer;

                this._scene?.resetScene();
            }
        });
    }

    public async handleDealDealerCard(
        response: SocketResponse<DealDealerCard>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            await this._scene?.dealDealerCard(response.payload);
        });
    }

    public async handleDealPlayerCard(
        response: SocketResponse<DealPlayerCard>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            await this._scene?.dealPlayerCard(response.payload);
        });
    }

    public async handleUnholeCard(
        response: SocketResponse<UnholeCardPayload>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            const unholedCard = await unholedCardSchema.validate(response.payload);
            await this._scene?.unholeCard(unholedCard);
        });
    }

    public async handleSplit(
        response: SocketResponse<GameSession>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            if (!this._playerID) {
                throw new Error("No player found");
            }

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
                this._ui.toggleActionBtnsVisible(validatedPlayer.availableActions);
                this._ui.toggleVisibleActionBtnsDisabled(true);

                await this._scene?.split({
                    oldHandID: validatedActiveHand.handID,
                    newHandID: newHand.handID,
                    bet: validatedActiveHand.bet,
                    points: validatedActiveHand.points,
                    playerID: validatedPlayer.playerID,
                });
            }
        });
    }

    public async handleFinishRoundForHand(
        response: SocketResponse<FinishRoundForHand>,
    ): Promise<void> {
        await this.handleResponse(response, async () => {
            if (!this._playerID) {
                throw new Error("No player found");
            }

            const validatedPlayerID = await playerIDSchema.validate(
                response.payload.playerID,
            );

            const validatedHandID = await handIDSchema.validate(
                response.payload.handID,
            );
            const validatedGameResult = await gameResultSchema.validate(
                response.payload.result,
            );

            this._ui.togglePlayerActionsBtnsDisabled(true);

            await this._scene?.removeHand(validatedPlayerID, validatedHandID, validatedGameResult);
        });
    }

    public async handleReassignActiveHand(response: SocketResponse<ReassignActiveHand>): Promise<void> {
        await this.handleResponse(response, async () => {
            const validatedId = await handIDSchema.validate(response.payload.handID);
            const validatedPlayerID = await playerIDSchema.validate(
                response.payload.playerID,
            );
            this._scene?.updateHelper({ handId: validatedId, playerID: validatedPlayerID });
        });
    }

    public async handleMakeDecision(response: SocketResponse<GameSession>): Promise<void> {
        await this.handleResponse(response, async () => {
            if (!this._playerID) {
                throw new Error("No player found");
            }
            const session = await gameSessionSchema.validate(response.payload);
            const player = pickPlayerInstance({
                playerID: this._playerID,
                players: session.players,
            });
            if (player) {
                const validatedPlayer = await playerSchema.validate(player);
                this._session = session;
                this._ui.player = validatedPlayer;
                this._ui.toggleVisibleActionBtnsDisabled(false);
            }
        });
    }

    private async handleResponse<T>(response: SocketResponse<T>, handler: () => Promise<void>): Promise<void> {
        try {
            if (response.ok && response.payload) {
                await handler();
            } else {
                throw new Error("Invalid server response");
            }
        } catch (error) {
            console.log(error);
            await this.handleNotificate({
                ok: true,
                payload: {
                    variant: NotificationVariant.GameError,
                    text: "Ooops! Something is wrong.",
                },
                statusText: "ok",
            });
        }
    }
}
