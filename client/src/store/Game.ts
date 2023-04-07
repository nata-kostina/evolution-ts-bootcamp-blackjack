/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from "mobx";
import {
    PlayerInstance,
    GameSession,
    Action,
    GameStatus,
    Notification,
    ModalKinds,
    NotificationKind,
    YesNoAcknowledgement,
    Bet,
    Acknowledgment,
    NewCard,
    NotificationVariant,
} from "../types/types";
import { PlayerID, RoomID, SocketResponse } from "../types/socketTypes";
import { UIStore } from "./ui/UIstore";
import { CanvasBase } from "../canvas/CanvasBase";
import { pickPlayerInstance } from "../utils/storeUtils/pickPlayerInsrance";
import { SceneCanvasElement } from "../canvas/canvasElements/Scene.canvas.element";

export class Game {
    public ui: UIStore;
    public canvas: CanvasBase | null = null;
    public scene: SceneCanvasElement;

    public status: GameStatus = "starting";
    public session: GameSession | null = null;

    public playerID: PlayerID | null = null;
    public roomID: RoomID | null = null;

    public constructor(canvas: CanvasBase | null, ui: UIStore, scene: SceneCanvasElement) {
        this.canvas = canvas;
        this.scene = scene;
        this.ui = ui;
        makeAutoObservable(this);
    }

    public setPlayerID(connectionID: string): void {
        this.playerID = connectionID;
    }

    public finishGame(): void {
        this.status = "finished";
        if (this.roomID && this.playerID) {
            // this.ui.notification.resetQueue();
            // this.connection.socket.emit("finishGame", { roomID: this.roomID, playerID: this.playerID });
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
    }

    public updateStatus(value: GameStatus): void {
        this.status = value;
    }

    public handleStartGame(response: SocketResponse<GameSession>): void {
        console.log("handleStartGame: ", response);
        if (response.ok && response.payload && this.playerID) {
            const player = pickPlayerInstance({ playerID: this.playerID, players: response.payload.players });
            if (player) {
                this.session = response.payload;
                this.roomID = response.payload.roomID;
                this.ui.setDealer(response.payload.dealer);
                this.ui.setPlayer(player);
                this.ui.toggleActionBtns(player.availableActions);
                // this.ui.togglePlaceBetBtnDisabled(false);
                this.scene.toggleChipAction(true);
            }
        } else {
            this.status = "error";
        }
    }

    // public makeDecision(action: Action): void {

    // }

    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // private handleFinishGame(response: SocketResponse<PlayerInstance>): void {
    //     this.status = "finished";
    //     // this.ui.toggleActionBtns([]);
    // }

    public updateGameSession(response: SocketResponse<GameSession>): void {
        console.log("updateGameSession: ", response);
        if (response.ok && response.payload && this.playerID) {
            const player = pickPlayerInstance({ playerID: this.playerID, players: response.payload.players });
            if (player) {
                this.status = "in_progress";
                this.session = response.payload;
                this.ui.setDealer(response.payload.dealer);
                this.ui.setPlayer(player);
                this.ui.toggleActionBtns(player.availableActions);
                // this.scene.toggleChipAction(true);
            }
        } else {
            this.status = "error";
        }
    }

    public handlePlaceBetNotification(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload && this.playerID) {
            console.log("handlePlaceBetNotification");
            const player = pickPlayerInstance({ playerID: this.playerID, players: response.payload.players });
            if (player) {
                this.session = response.payload;
                this.ui.setDealer(response.payload.dealer);
                this.ui.setPlayer(player);
                this.ui.toggleActionBtns(player.availableActions);
                this.ui.togglePlaceBetBtnDisabled(true);
                this.ui.toggleBetEditBtnsDisabled(true);
                this.scene.toggleChipAction(false);
            }
        } else {
            this.status = "error";
        }
    }

    public handleNotificate(
        response: SocketResponse<Notification>,
    ): void {
        if (response.ok) {
            console.log("handleNotificate");
            switch (response.payload.variant) {
                case NotificationVariant.Blackjack:
                    this.scene.addBlackjackNotification();
                    break;
                case NotificationVariant.StandOrTakeMoney:
                    this.ui.addNotificationModal({
                        type: ModalKinds.YesNo,
                        notification: response.payload,
                    });
                    break;
                case NotificationVariant.Insurance:
                    this.ui.addHelper(Action.INSURANCE);
                    break;
                default:
                    break;
            }
            // switch (response.payload.kind) {
            //     case NotificationKind.Ok: {
            //         this.ui.addNotificationModal({
            //             type: ModalKinds.Disappearing,
            //             notification: response.payload,
            //         });
            //         break;
            //     }
            //     case NotificationKind.YesNo: {
            //         // this.ui.notification.add({
            //         //     type: ModalKinds.YesNo,
            //         //     notification: response.payload,
            //         //     handleAnswer: (ack: YesNoAcknowledgement) => {
            //         //         if (acknowledge && this.playerID) {
            //         //             acknowledge({ playerID: this.playerID, answer: ack });
            //         //         }
            //         //     },
            //         // });
            //         break;
            //     }
            //     default:
            //         break;
            // }
            // this.status = changeStatus(this.status, response.payload.variant);
        } else {
            this.status = "error";
        }
    }

    // private handleGetDecision(
    //     response: SocketResponse<GameSession>,
    //     acknowledge: (ack: Acknowledgment<Decision>) => void,
    // ): void {
    //     if (response.ok) {
    //         this.ui.setGameSession(response.payload);
    //         this.ui.setDecisionHandler((decision) => {
    //             if (acknowledge && this.playerID) {
    //                 acknowledge({ playerID: this.playerID, answer: decision });
    //             }
    //             this.ui.resetDecisionHandler();
    //         });
    //     } else {
    //         this.status = "error";
    //     }
    // }

    public handleFinishRound(response: SocketResponse<GameSession>): void {
        if (response.ok && response.payload && this.playerID) {
            console.log("handleFinishRound: ", response.payload);
            const player = pickPlayerInstance({ playerID: this.playerID, players: response.payload.players });
            if (player) {
                this.session = response.payload;
                this.ui.clearBets();
                this.ui.setDealer(response.payload.dealer);
                this.ui.setPlayer(player);
                this.ui.toggleActionBtns(player.availableActions);
                this.ui.resetHelperTarget();
                this.scene.toggleChipAction(true);
                this.scene.removeCards();
            }
        } else {
            this.status = "error";
        }
    }

    public handleDealCard(response: SocketResponse<NewCard>): void {
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
