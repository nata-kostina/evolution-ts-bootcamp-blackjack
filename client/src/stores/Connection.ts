import { makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";
import { Game } from "./Game";
import { errorConncetionNumLimit } from "../constants/connection.constants";
import {
    ServerToClientEvents,
    ClientToServerEvents,
    RequestParameters,
    SocketStatus,
} from "../types/socket.types";
import { RoomID } from "../types/game.types";
import { ResponseQueue } from "./ResponseHandlerQueue";
import { NotificationVariant } from "../types/notification.types";

export class Connection {
    private _status: SocketStatus = SocketStatus.Waiting;
    private _connectionErrorCounter = 0;
    private _connectionID: string | null = null;
    private _roomID: RoomID | null = null;
    private readonly _socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private readonly _game: Game;
    private readonly _responseHandlerQueue: ResponseQueue;

    public constructor(serverURL: string, game: Game) {
        this._responseHandlerQueue = new ResponseQueue();

        this._game = game;

        this._socket = io(serverURL, {
            withCredentials: true,
            transports: ["websocket"],
        });

        this._socket.on("connect", () => {
            this._connectionErrorCounter = 0;
            this.status = SocketStatus.Connected;
            this._connectionID = this._socket.id;
            this._game.playerID = this._socket.id;
        });

        this._socket.on("disconnect", () => {
            this.status = SocketStatus.Disconnected;
            this._game.handleNotificate({
                ok: true,
                payload: { variant: NotificationVariant.Disconnection, text: "Ooops! Server was disconnected" },
                statusText: "ok",
            });
        });

        this._socket.on("connect_error", () => {
            this._connectionErrorCounter++;
            if (this._connectionErrorCounter > errorConncetionNumLimit) {
                this.status = SocketStatus.WithError;
                this._socket.disconnect();
                this._game.handleNotificate({
                    ok: true,
                    payload: { variant: NotificationVariant.Disconnection, text: "Ooops! Can't reach server" },
                    statusText: "ok",
                });
            }
        });

        this._socket.on("initGame", (response) => {
            if (response.ok) {
                this.status = SocketStatus.Initialized;
                this._roomID = response.payload.game.roomID;
                this._game.roomID = this._roomID;
            }
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleInitGame(response);
            });
        });

        this._socket.on("placeBet", (reponse) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handlePlaceBet(reponse);
            });
        });

        this._socket.on("updateSession", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleUpdateGameSession(response);
            });
        });

        this._socket.on("dealDealerCard", (reponse) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleDealDealerCard(reponse);
            });
        });

        this._socket.on("dealPlayerCard", (reponse) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleDealPlayerCard(reponse);
            });
        });

        this._socket.on("notificate", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleNotificate(response);
            });
        });

        this._socket.on("unholeCard", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleUnholeCard(response);
            });
        });

        this._socket.on("finishRound", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleFinishRound(response);
            });
        });

        this._socket.on("split", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleSplit(response);
            });
        });
        this._socket.on("finishRoundForHand", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleFinishRoundForHand(response);
            });
        });
        this._socket.on("reassignActiveHand", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleReassignActiveHand(response);
            });
        });
        this._socket.on("makeDecision", (response) => {
            this._responseHandlerQueue.enqueue(async () => {
                await this._game.handleMakeDecision(response);
            });
        });

        makeAutoObservable(this);
    }

    public get roomID(): string | null {
        return this._roomID;
    }

    public get isInitialized(): boolean {
        return this._status === SocketStatus.Initialized;
    }

    public get status(): SocketStatus {
        return this._status;
    }

    public set status(value: SocketStatus) {
        this._status = value;
    }

    public sendRequest<Event extends keyof ClientToServerEvents>(
        request: RequestParameters<Event>,
    ): void {
        this._socket.emit(request.event, ...request.payload);
    }
}
