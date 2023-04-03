/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from "mobx";
import { PlayerID } from "../types/socketTypes";
import { GameSession } from "../types/types";
import { drawScene } from "./utils/drawScene";

class CanvasStore {
    public context: CanvasRenderingContext2D | null = null;
    public balance = 2000;
    public playerID: PlayerID | null = null;
    // public balanceElement = new BalanceCanvasElement()

    public constructor() {
        makeAutoObservable(this);
    }

    public setContext(ctx: CanvasRenderingContext2D): void {
        this.context = ctx;
    }

    public draw(): void {
        if (this.context) {
            drawScene(this.context);
        }
    }

    public setPlayerID(playerID: PlayerID): void {
        this.playerID = playerID;
    }

    public setGameSession(session: GameSession): void {
        try {
            console.log("canvasStore setGameSession");
            // const playerID = Object.keys(session.players).find((p) => p === this.playerID);

            // this.dealer = session.dealer;
            // this.players = session.players;
            // this.roomID = session.roomID;
            // const player = this.getPlayer(session.players);
            // this.toggleActionBtns(this.player.availableActions);
        } catch (error) {}
    }

    public updateBalance(value: number): void {
        this.balance = value;
    }
}

export const canvasStore = new CanvasStore();
