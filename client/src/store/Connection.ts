/* eslint-disable import/no-cycle */
import { makeAutoObservable } from "mobx";
import { io, Socket } from "socket.io-client";
import { game } from ".";
import { ServerToClientEvents, ClientToServerEvents } from "../types/socketTypes";

type Disconnected = "disconnected";
type Connected = "connected";
type Waiting = "waiting";
type WithError = "error";

type SocketStatus = Disconnected | Connected | Waiting | WithError;

export class Connection {
    public socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    public status: SocketStatus = "waiting";
    public constructor() {
        this.socket = io("http://localhost:3000", {
            withCredentials: true,
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            console.log("Socket is connected");
            this.status = "connected";
            game.setPlayerID(this.socket.id);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket is disconnected");
            this.status = "disconnected";
        });

        this.socket.on("connect_error", () => {
            const errorMsg = "Sorry, there seems to be an issue with the connection!";
            console.log(errorMsg);
            this.status = "error";
        });

        makeAutoObservable(this);
    }

    public get isFailed(): boolean {
        return this.status === "error" || this.status === "disconnected";
    }
}
