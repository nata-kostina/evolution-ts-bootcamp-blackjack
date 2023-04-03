/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents, RequestParameters } from "../types/socketTypes";
import { Game } from "./Game";

type Disconnected = "disconnected";
type Connected = "connected";
type Waiting = "waiting";
type WithError = "error";

type SocketStatus = Disconnected | Connected | Waiting | WithError;

export class Connection {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    private status: SocketStatus = "waiting";
    private connectionErrorCounter = 0;
    private game: Game;
    private connectionID: string;

    public constructor(serverURL: string, game: Game) {
        this.game = game;

        this.socket = io(serverURL, {
            withCredentials: true,
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            this.connectionErrorCounter = 0;
            this.status = "connected";
            this.setConnectionID(this.socket.id);
            console.log("Socket is connected");
        });

        this.socket.on("disconnect", () => {
            console.log("Socket is disconnected");
            this.status = "disconnected";
        });

        this.socket.on("connect_error", () => {
            this.connectionErrorCounter++;
            const errorMsg = "Sorry, there seems to be an issue with the connection!";
            console.log(errorMsg);
            if (this.connectionErrorCounter > 5) {
                this.status = "error";
            }
        });

        this.socket.on("startGame", (reponse) => {
            if (this.game) {
                // this.game.handleStartGame(reponse);
            }
        });
        // this.socket.on("placeBet", (reponse, acknowledge) => this.handlePlaceBet(reponse, acknowledge));
        // this.socket.on("dealCard", (reponse) => this.handleDealCard(reponse));
        // this.socket.on("updateSession", (response) => this.updateGameSession(response));
        // this.socket.on("notificate", (response, acknowledge) => this.handleNotificate(response, acknowledge));
        // this.socket.on("getDecision", (response, acknowledgement) => this.handleGetDecision(response, acknowledgement));
        // this.socket.on("finishRound", (response) => this.handleFinishRound(response));

        makeAutoObservable(this);
    }

    public get isFailed(): boolean {
        return this.status === "error" || this.status === "disconnected";
    }

    public get isWaiting(): boolean {
        return this.status === "waiting";
    }

    public sendRequest<Event extends keyof ClientToServerEvents>(request: RequestParameters<Event>): void {
        this.socket.emit<Event>(request.event, ...request.payload);
    }

    public setGame(game: Game): void {
        this.game = game;
    }

    public getConncetionID(): string {
        return this.connectionID;
    }

    private setConnectionID(id: string): void {
        this.connectionID = this.socket.id;
        this.game.setPlayerID();
    }
}
