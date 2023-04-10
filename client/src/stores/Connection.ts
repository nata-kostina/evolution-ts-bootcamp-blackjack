/* eslint-disable @typescript-eslint/no-floating-promises */
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

export class Connection {
    private _socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private _status: SocketStatus = SocketStatus.Waiting;
    private _connectionErrorCounter = 0;
    private _game: Game;
    private _connectionID: string | null = null;
    private _roomID: RoomID | null = null;

    public constructor(serverURL: string, game: Game) {
        this._game = game;

        this._socket = io(serverURL, {
            withCredentials: true,
            transports: ["websocket"],
        });

        this._socket.on("connect", () => {
            this._connectionErrorCounter = 0;
            this._status = SocketStatus.Connected;
            this._connectionID = this._socket.id;
            this._game.playerID = this._socket.id;
        });

        this._socket.on("disconnect", () => {
            this._status = SocketStatus.Disconnected;
        });

        this._socket.on("connect_error", () => {
            this._connectionErrorCounter++;
            if (this._connectionErrorCounter > errorConncetionNumLimit) {
                this._status = SocketStatus.WithError;
            }
        });

        this._socket.on("startGame", async (response) => {
            this._roomID = response.payload.roomID;
            this._game.roomID = this._roomID;
            this._game.handleStartGame(response);
        });
        this._socket.on("placeBet", (reponse) => {
            this._game.handlePlaceBetNotification(reponse).then(() => {
                if (this.roomID) {
                    this.sendRequest<"startPlay">({
                        event: "startPlay",
                        payload: [{ roomID: this.roomID, playerID: this._socket.id }],
                    });
                }
            });
        });
        this._socket.on("updateSession", async (response) =>
      this._game.handleUpdateGameSession(response),
        );
        this._socket.on("dealCard", async (reponse) =>
      this._game.handleDealCard(reponse),
        );
        this._socket.on("notificate", async (response) =>
      this._game.handleNotificate(response),
        );
        this._socket.on("unholeCard", async (response) =>
      this._game.handleUnholeCard(response),
        );
        this._socket.on("finishRound", async (response) =>
      this._game.handleFinishRound(response),
        );

        makeAutoObservable(this);
    }

    public get conncetionID(): string | null {
        return this._connectionID;
    }

    public get roomID(): string | null {
        return this._roomID;
    }

    public get isFailed(): boolean {
        return this._status === "error" || this._status === "disconnected";
    }

    public get isWaiting(): boolean {
        return this._status === "waiting";
    }

    public sendRequest<Event extends keyof ClientToServerEvents>(
        request: RequestParameters<Event>,
    ): void {
        this._socket.emit(request.event, ...request.payload);
    }
}
