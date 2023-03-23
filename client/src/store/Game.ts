/* eslint-disable import/no-duplicates */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-cycle */
/* eslint-disable no-debugger */
import { makeAutoObservable, reaction } from "mobx";
import { toJS } from "mobx";
import { redirect } from "react-router-dom";
import {
    GameError,
    PlayerInstance,
    GameSession,
    Decision,
    GameStatus,
    Notification,
    ModalKinds,
    NotificationKind,
    YesNoAcknowledgement,
    GameMode,
} from "../types/types";
import { Connection } from "./Connection";
import { ErrorHandler } from "../utils/ErrorHandler";
import { PlayerID, RoomID, SocketResponse, SpecificID } from "../types/socketTypes";
import { changeStatus } from "../utils/controller/changeStatus";
import { connection } from ".";
import { UIStore } from "./ui/UIstore";

export class Game {
    public connection: Connection;
    public status: GameStatus = "starting";
    public ui: UIStore;
    public session: GameSession | null = null;
    public error: GameError | null = null;
    public errorHandler: ErrorHandler = new ErrorHandler();
    public playerID: PlayerID | null = null;
    public roomID: RoomID | null = null;
    public player: PlayerInstance | null = null;
    public balance = 0;
    private mode: GameMode = GameMode.Single;

    public constructor() {
        this.connection = connection;
        this.ui = new UIStore();
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
        this.connection.socket.on("makeDecision", (response) =>
      this.updateGameSession(response),
        );
        this.connection.socket.on("updateSession", (response) =>
      this.updateGameSession(response),
        );
        this.connection.socket.on("notificate", (response, acknowledge) =>
      this.handleNotificate(response, acknowledge),
        );
        this.connection.socket.on("waitOthers", (response) =>
      this.handleWaitOthers(response),
        );
        this.connection.socket.on("getDecision", (response, acknowledgement) =>
      this.handleGetDecision(response, acknowledgement),
        );
        this.connection.socket.on("finishRound", (response) =>
      this.handleFinishRound(response),
        );

        makeAutoObservable(this);

        reaction(
      () => this.playerID,
      (playerID: PlayerID | null) => {
          if (playerID) {
              this.ui.setPlayerID(playerID);
          }
      },
        );

        reaction(
      () => this.status,
      (status: GameStatus) => {
          if (status === "new-game") {
              redirect("/");
          }
      },
        );
    }

    public setPlayerID(playerID: PlayerID): void {
        this.playerID = playerID;
    }

    public startGame(mode: GameMode): void {
        this.status = "starting";
        this.mode = mode;
        if (this.playerID) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            this.connection.socket.emit("startGame", {
                playerID: this.playerID,
                mode,
            });
        } else {
            console.log("Connection lost");
        }
    }

    public finishGame(): void {
        this.status = "finished";
        if (this.playerID) {
            this.connection.socket.emit("finishGame", {
                roomID: this.connection.socket.id,
                playerID: this.playerID,
            });
        }
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

    // public getPlayer(): void {
    //     this.connection.socket.emit("getPlayer", {
    //         roomID: this.connection.socket.id,
    //         playerID: this.connection.socket.id,
    //     });
    // }

    public imitateErrorResponse(): void {
        this.status = "error";
        this.error = GameError.PlayerError;
        // this.errorHandler.setHandler({ execute: () => this.getPlayer() });
    }

    public placeBet(): void {
        if (this.playerID && this.roomID && this.ui.player) {
            this.status = "in_progress";
            this.connection.socket.emit("placeBet", {
                roomID: this.roomID,
                playerID: this.playerID,
                bet: this.ui.player.bet,
                mode: this.mode,
            });
        } else {
            this.status = "error";
        }
    }

    public getPlayerInstance(
        players: Record<PlayerID, PlayerInstance>,
    ): PlayerInstance {
        const playerID = Object.keys(players).find((p) => p === this.playerID);
        if (playerID) {
            return players[playerID];
        }
        throw new Error("Failed to get current player");
    }

    public makeDecision(decision: Decision): void {
        if (this.session) {
            this.connection.socket.emit("makeDecision", {
                decision,
                id: {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    playerID: this.playerID as string,
                    roomID: this.session.roomID,
                },
            });
        } else {
            console.warn("makeDecision: No session found");
        }
    }

    public updateStatus(value: GameStatus): void {
        this.status = value;
    }

    private handleStartGame(response: SocketResponse<GameSession>): void {
        console.log(response);
        if (response.ok && response.payload) {
            this.session = response.payload;
            const player = this.getPlayerInstance(response.payload.players);
            this.player = player;
            this.roomID = response.payload.roomID;
            this.ui.setGameSession(response.payload);
            this.ui.placePlayers();
        } else {
            this.status = "error";
            this.error = GameError.GameError;
            // this.errorHandler.setHandler({ execute: () => this.startGame() });
        }
    }

    private handleGetPlayer(response: SocketResponse<PlayerInstance>): void {
        if (response.ok && response.payload) {
            this.status = "in_progress";
            this.ui.setPlayerInfo(response.payload);
        } else {
            this.status = "error";
            this.error = GameError.PlayerError;
            // this.errorHandler.setHandler({ execute: () => this.getPlayer() });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handleFinishGame(response: SocketResponse<PlayerInstance>): void {
        this.status = "finished";
    }

    private updateGameSession(response: SocketResponse<GameSession>): void {
        console.log(response);
        if (response.ok && response.payload) {
            this.status = "in_progress";
            this.session = response.payload;
            this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
        }
    }

    private handlePlaceBet(response: SocketResponse<GameSession>): void {
        console.log("handlePlaceBet: ", response);
        if (response.ok && response.payload) {
            // this.status = "waiting-cards";
            this.session = response.payload;
            this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
        }
    }

    private handleNotificate(
        response: SocketResponse<Notification>,
        acknowledge: (answer: { playerID: PlayerID; ack: YesNoAcknowledgement; }) => void,
    ): void {
        if (response.ok) {
            switch (response.payload.kind) {
                case NotificationKind.Ok: {
                    this.ui.notification.add({
                        type: ModalKinds.Disappearing,
                        notification: response.payload,
                    });
                    break;
                }
                case NotificationKind.YesNo: {
                    this.ui.notification.add({
                        type: ModalKinds.YesNo,
                        notification: response.payload,
                        handleAnswer: (ack: YesNoAcknowledgement) => {
                            console.log("handle answer inside, ack ", ack);
                            if (acknowledge && this.playerID) {
                                acknowledge({ playerID: this.playerID, ack });
                            }
                        },
                    });
                    break;
                }
                default:
                    break;
            }
            this.status = changeStatus(this.status, response.payload.variant);
        } else {
            this.status = "error";
        }
    }

    private handleGetDecision(
        response: SocketResponse<string>,
        acknowledge: (answer: { playerID: PlayerID; ack: Decision; }) => void,
    ): void {
        if (response.ok) {
            this.ui.setDecisionHandler((decision) => {
                if (acknowledge && this.playerID) {
                    acknowledge({ playerID: this.playerID, ack: decision });
                }
                this.ui.resetDecisionHandler();
            });
        } else {
            this.status = "error";
        }
    }

    private handleFinishRound(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload) {
            this.session = response.payload;
            const player = this.getPlayerInstance(response.payload.players);
            this.player = player;
            this.roomID = response.payload.roomID;
            this.ui.setGameSession(response.payload);
            // this.ui.placePlayers();
            // this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
        }
    }

    private handleWaitOthers(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload) {
            this.session = response.payload;
            this.status = "waiting-bet";
            this.ui.setGameSession(response.payload);
        } else {
            this.status = "error";
        }
    }
}
