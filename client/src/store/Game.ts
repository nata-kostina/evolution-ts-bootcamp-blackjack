import { makeAutoObservable } from "mobx";
import {
    GameError,
    PlayerInstance,
    ECommand,
    GameSession,
    Decision,
    GameStatus,
    Notification,
    NotificationVariant,
    ModalKinds,
} from "../types/types";
import { Connection } from "./Connection";
import { ErrorHandler } from "../utils/ErrorHandler";
import { SocketResponse } from "../types/socketTypes";
import { UIStore } from "./ui/UIstore";
import { getNextCommand } from "../utils/controller/getNextCommand";

export class Game {
    public connection: Connection;
    public status: GameStatus = "starting";
    public ui: UIStore;
    public session: GameSession | null = null;
    public error: GameError | null = null;
    public errorHandler: ErrorHandler = new ErrorHandler();
    public request: ECommand = ECommand.Waiting;

    public constructor(connection: Connection, ui: UIStore) {
        this.connection = connection;
        this.ui = ui;
        this.connection.socket.on("startGame", (reponse) =>
      this.handleStartGame(reponse),
        );
        this.connection.socket.on("getPlayer", (response) =>
      this.handleGetPlayer(response),
        );
        this.connection.socket.on("finishGame", (response) =>
      this.handleFinishGame(response),
        );
        this.connection.socket.on("placeBet", (response) =>
      this.handlePlaceBet(response),
        );
        this.connection.socket.on("getCards", (response) =>
      this.handleGetCards(response),
        );
        this.connection.socket.on("makeDecision", (response) =>
      this.updateGameSession(response),
        );
        this.connection.socket.on("updateSession", (response, callback) =>
      this.updateGameSession(response, callback),
        );
        this.connection.socket.on("notificate", (response) =>
      this.handleNotificate(response),
        );

        makeAutoObservable(this);
    }

    public startGame(): void {
        this.status = "starting";
        this.connection.socket.emit("startGame", this.connection.roomID);
    }

    public finishGame(): void {
        this.status = "finished";
        this.connection.socket.emit("finishGame", {
            roomID: this.connection.socket.id,
            playerID: this.connection.socket.id,
        });
    }

    public get isFailed(): boolean {
        return this.status === "error";
    }

    public get isDecisionEnabled(): boolean {
        return this.status === "waiting-decision";
    }

    public get isPlaceBetAvailable(): boolean {
        return this.status === "waiting-bet";
    }

    public setNextRequest(): void {
        const nextRequest = getNextCommand(this.status);
        this.request = nextRequest;
    }

    public getPlayer(): void {
        this.connection.socket.emit("getPlayer", {
            roomID: this.connection.socket.id,
            playerID: this.connection.socket.id,
        });
    }

    public imitateErrorResponse(): void {
        this.status = "error";
        this.error = GameError.PlayerError;
        this.errorHandler.setHandler({ execute: () => this.getPlayer() });
    }

    public placeBet(): void {
        if (this.ui.session) {
            this.status = "in_progress";
            this.connection.socket.emit("placeBet", {
                roomID: this.connection.socket.id,
                playerID: this.connection.socket.id,
                bet: this.ui.session.player.bet,
            });
        } else {
            this.status = "error";
            this.error = GameError.PlayerError;
            this.errorHandler.setHandler({ execute: () => this.getPlayer() });
        }
    }

    public makeDecision(decision: Decision): void {
        if (this.session) {
            this.connection.socket.emit("makeDecision", {
                decision,
                id: {
                    playerID: this.session.player.playerID,
                    roomID: this.session.roomID,
                },
            });
        } else {
            console.warn("Get cards: No session found");
        }
    }

    private handleStartGame(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload) {
            this.session = response.payload;
            this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
            this.error = GameError.GameError;
            this.errorHandler.setHandler({ execute: () => this.startGame() });
        }
    }

    private handleGetPlayer(response: SocketResponse<PlayerInstance>): void {
        if (response.ok && response.payload) {
            this.status = "in_progress";
            this.ui.setPlayerInfo(response.payload);
            this.request = ECommand.Waiting;
        } else {
            this.status = "error";
            this.error = GameError.PlayerError;
            this.errorHandler.setHandler({ execute: () => this.getPlayer() });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handleFinishGame(response: SocketResponse<PlayerInstance>): void {
        this.status = "finished";
    }

    private updateGameSession(response: SocketResponse<GameSession>, callback?: ({ ok }: { ok: boolean; }) => void): void {
        if (response.ok && response.payload) {
            this.status = "in_progress";
            this.session = response.payload;
            this.request = ECommand.Waiting;
            if (callback) {
                callback({ ok: true });
            }
            this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
            if (callback) {
                callback({ ok: false });
            }
            this.error = GameError.GameError;
            this.errorHandler.setHandler({ execute: () => {} });
        }
    }

    private handlePlaceBet(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload) {
            this.status = "waiting-cards";
            this.session = response.payload;
            this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
            this.error = GameError.PlayerError;
            this.errorHandler.setHandler({ execute: () => this.getPlayer() });
        }
    }

    private handleGetCards(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload) {
            this.session = response.payload;
            this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
            this.error = GameError.PlayerError;
            this.errorHandler.setHandler({ execute: () => this.getPlayer() });
        }
    }

    private handleNotificate(response: SocketResponse<Notification>): void {
        if (response.ok && response.payload) {
            switch (response.payload.type) {
                case NotificationVariant.Blackjack:
                    this.ui.notification.add({
                        type: ModalKinds.Disappearing,
                        text: response.payload.text,
                    });
                    break;
                case NotificationVariant.StandOrTakeMoney:
                    this.ui.notification.add({
                        type: ModalKinds.YesNo,
                        text: response.payload.text,
                        positiveCallback: () => {
                            if (this.session) {
                                this.connection.socket.emit("requestMoney", {
                                    playerID: this.session.player.playerID,
                                    roomID: this.session.roomID,
                                });
                            } else {
                                this.status = "error";
                            }
                        },
                        negativeCallback: () => {
                            if (this.session) {
                                // this.status = "waits-for-dealer";
                                this.connection.socket.emit("denyTakeMoney", {
                                    playerID: this.session.player.playerID,
                                    roomID: this.session.roomID,
                                });
                            } else {
                                this.status = "error";
                            }
                        },
                    });
                    break;
                case NotificationVariant.Victory:
                    this.ui.notification.add({
                        type: ModalKinds.Disappearing,
                        text: response.payload.text,
                    });
                    break;
                case NotificationVariant.PlaceBet:
                    this.status = "waiting-bet";
                    this.ui.notification.add({
                        type: ModalKinds.Disappearing,
                        text: response.payload.text,
                    });
                    break;
                case NotificationVariant.MakeDecision:
                    this.status = "waiting-decision";
                    this.ui.notification.add({
                        type: ModalKinds.Disappearing,
                        text: response.payload.text,
                    });
                    break;
                default:
                    // const modal2: YesNoModal = {
                    //     type: ModalKinds.YesNo,
                    //     positiveCallback: () => this.status = "waiting-cards",
                    //     negativeCallback: () => this.status = "waits-for-dealer",
                    // };
                    break;
            }
        } else {
            this.status = "error";
            this.error = GameError.PlayerError;
            this.errorHandler.setHandler({ execute: () => this.getPlayer() });
        }
    }
}
