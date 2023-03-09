import { makeAutoObservable } from "mobx";
import { Deck, IPlayer, SocketResponse } from "../types/types";
import { Connection } from "./Connection";
import { ErrorHandler } from "../utils/ErrorHandler";

type GameStatus = "starting" | "started" | "in_progress" | "finished" | "error" | "ignore-error";

export class Game {
    public connection: Connection;
    public status: GameStatus = "starting";
    public players: IPlayer[] = [];
    public errorHandler: ErrorHandler = new ErrorHandler();

    public constructor(connection: Connection) {
        this.connection = connection;
        this.connection.socket.on("startGame", (reponse) => this.handleStartGame(reponse));
        makeAutoObservable(this);
    }

    public startGame(): void {
        this.status = "starting";
        this.connection.socket.emit("startGame", this.connection.roomID);
    }

    public finishGame(): void {
        this.status = "finished";
    }

    public resetGame(): void {
        this.status = "starting";
    }

    public ignoreError(): void {
        this.status = "ignore-error";
    }

    private handleStartGame(response: SocketResponse<Deck>): void {
        if (response.ok) {
            this.status = "started";
        } else {
            this.status = "error";
            this.errorHandler.setHandler({ execute: () => this.startGame() });
        }
    }
}
