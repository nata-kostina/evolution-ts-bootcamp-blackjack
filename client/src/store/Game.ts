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
    Bet,
    Acknowledgment,
    AvailableActions,
    NewCard,
    CardValue,
    Suit,
    Card,
} from "../types/types";
import { Connection } from "./Connection";
import { ErrorHandler } from "../utils/ErrorHandler";
import { PlayerID, RoomID, SocketResponse, SpecificID } from "../types/socketTypes";
import { changeStatus } from "../utils/controller/changeStatus";
import { connection } from ".";
import { UIStore } from "./ui/UIstore";
import { CanvasBase } from "../canvas/CanvasBase";
import { SceneCanvasElement } from "../canvas/canvasElements/Scene.canvas.element";

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
    public baseCanvas: CanvasBase;
    public scene: SceneCanvasElement;

    public constructor() {
        this.connection = connection;
        this.baseCanvas = new CanvasBase();
        this.scene = new SceneCanvasElement(this.baseCanvas);
        this.ui = new UIStore();
        this.connection.socket.on("startGame", (reponse) =>
      this.handleStartGame(reponse),
        );
        this.connection.socket.on("placeBet", (reponse, acknowledge) =>
      this.handlePlaceBet(reponse, acknowledge),
        );
        this.connection.socket.on("dealCard", (reponse) =>
      this.handleDealCard(reponse),
        );
        this.connection.socket.on("updateSession", (response) =>
      this.updateGameSession(response),
        );
        this.connection.socket.on("notificate", (response, acknowledge) =>
      this.handleNotificate(response, acknowledge),
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
        console.log("setPlayerID");
        this.playerID = playerID;
    }

    public startGame(mode: GameMode): void {
        // this.status = "loading";
        if (this.playerID) {
            // this.ui.togglePlaceBetBtn(false);
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion

            this.scene.addContent();
            // this.scene.dealDealerCard({ id: "34235", suit: Suit.Clubs, value: CardValue.NINE });
            // setTimeout(() => { this.scene.dealPlayerCard({ id: "df", suit: Suit.Diamonds, value: CardValue.FOUR }); }, 1000);

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
        if (this.roomID && this.playerID) {
            this.ui.notification.resetQueue();
            this.connection.socket.emit("finishGame", { roomID: this.roomID, playerID: this.playerID });
        }
    }

    public get isFailed(): boolean {
        return this.status === "error";
    }

    public get isLoading(): boolean {
        return this.status === "loading";
    }

    public get isReady(): boolean {
        return (this.status !== "loading") && (this.status !== "error");
    }

    public imitateErrorResponse(): void {
        this.status = "error";
        // this.errorHandler.setHandler({ execute: () => this.getPlayer() });
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
            // this.ui.placePlayers();
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
        this.ui.toggleActionBtns([]);
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

    private handlePlaceBet(response: SocketResponse<GameSession>,
        acknowledgement: (responses: Acknowledgment<Bet>) => void): void {
        if (response.ok && response.payload) {
            this.ui.setGameSession(response.payload);
            this.ui.togglePlaceBetBtn(false);
            this.scene.toggleChipAction(true);
            this.ui.setBetHandler((bet) => {
                if (this.playerID) {
                    this.status = "in_progress";
                    acknowledgement({ playerID: this.playerID, answer: bet });
                    this.ui.resetBetHandler();
                    this.scene.toggleChipAction(false);
                    this.ui.togglePlaceBetBtn(true);
                }
            });
        } else {
            this.status = "error";
        }
    }

    private handleNotificate(
        response: SocketResponse<Notification>,
        acknowledge?: (ack: Acknowledgment<YesNoAcknowledgement>) => void,
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
                            if (acknowledge && this.playerID) {
                                acknowledge({ playerID: this.playerID, answer: ack });
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
        response: SocketResponse<GameSession>,
        acknowledge: (ack: Acknowledgment<Decision>) => void,
    ): void {
        if (response.ok) {
            this.ui.setGameSession(response.payload);
            this.ui.setDecisionHandler((decision) => {
                if (acknowledge && this.playerID) {
                    acknowledge({ playerID: this.playerID, answer: decision });
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
            this.ui.toggleNewBetDisabled(false);
            this.ui.setGameSession(response.payload);
            // this.ui.togglePlaceBetBtn(false);
            // this.startGame(GameMode.Single);
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

    private handleDealCard(response: SocketResponse<NewCard>): void {
        console.log("handleDealCard");
        if (response.ok && response.payload) {
            if (response.payload.target === "player") {
                this.scene.dealPlayerCard(response.payload);
            } else {
                this.scene.dealDealerCard(response.payload);
            }
        } else {
            this.status = "error";
        }
    }
}
