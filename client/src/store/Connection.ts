/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";
import { Game } from "./Game";
import { SocketStatus } from "../types/types";
import { errorConncetionNumLimit } from "../constants/connection.constants";
import { ServerToClientEvents, ClientToServerEvents, RequestParameters, RoomID } from "../types/socketTypes";

export class Connection {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private status: SocketStatus = SocketStatus.Waiting;
    private connectionErrorCounter = 0;
    private game: Game;
    private connectionID: string | null = null;
    private roomID: RoomID | null = null;

    public constructor(serverURL: string, game: Game) {
        this.game = game;

        this.socket = io(serverURL, {
            withCredentials: true,
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            this.connectionErrorCounter = 0;
            this.status = SocketStatus.Connected;
            this.setConnectionID(this.socket.id);
            console.log("Socket is connected");
        });

        this.socket.on("disconnect", () => {
            console.log("Socket is disconnected");
            this.status = SocketStatus.Disconnected;
        });

        this.socket.on("connect_error", () => {
            this.connectionErrorCounter++;
            const errorMsg = "Sorry, there seems to be an issue with the connection!";
            console.log(errorMsg);
            if (this.connectionErrorCounter > errorConncetionNumLimit) {
                this.status = SocketStatus.WithError;
            }
        });

        this.socket.on("startGame", (response) => {
            console.log("socket on start Game");
            this.roomID = response.payload.roomID;
            this.game.handleStartGame(response);
        });
        this.socket.on("placeBet", (reponse) => this.game.handlePlaceBetNotification(reponse));
        this.socket.on("updateSession", (response) => this.game.updateGameSession(response));
        this.socket.on("dealCard", (reponse) => this.game.handleDealCard(reponse));
        this.socket.on("notificate", (response) => this.game.handleNotificate(response));
        this.socket.on("unholeCard", (response) => this.game.handleUnholeCard(response));
        // this.socket.on("getDecision", (response, acknowledgement) => this.handleGetDecision(response, acknowledgement));
        this.socket.on("finishRound", (response) => this.game.handleFinishRound(response));

        makeAutoObservable(this);
    }

    public get isFailed(): boolean {
        return this.status === "error" || this.status === "disconnected";
    }

    public get isWaiting(): boolean {
        return this.status === "waiting";
    }

    public sendRequest<Event extends keyof ClientToServerEvents>(request: RequestParameters<Event>): void {
        this.socket.emit(request.event, ...request.payload);
    }

    public getConncetionID(): string | null {
        return this.connectionID;
    }

    public getRoomID(): string | null {
        return this.roomID;
    }

    private setConnectionID(id: string): void {
        this.connectionID = this.socket.id;
        this.game.setPlayerID(id);
    }
}
