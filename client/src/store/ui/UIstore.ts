import { makeAutoObservable } from "mobx";
import { GameSession, PlayerInstance } from "../../types/types";
import { ErrorHandler } from "../../utils/ErrorHandler";
import { Connection } from "../Connection";
import { UINotification } from "./UInotification";

export class UIStore {
    public session: GameSession | null = null;
    public betHistory: number[] = [];
    public connection: Connection;
    public errorHandler: ErrorHandler = new ErrorHandler();
    public notification: UINotification = new UINotification();
    public constructor(connection: Connection) {
        this.connection = connection;
        makeAutoObservable(this);
    }

    public setPlayerInfo(playerInfo: PlayerInstance): void {
        const updatedState = this.session ? { ...this.session, player: playerInfo } : null;
        this.session = updatedState;
    }

    public setGameSession(session: GameSession): void {
        this.session = session;
    }

    public addBet(bet: number): void {
        if (this.session) {
            this.session.player.bet += bet;
            this.session.player.balance -= bet;
            this.betHistory.push(bet);
        } else {
            this.errorHandler.setHandler({ execute: () => {} });
        }
    }

    public undoBet(): void {
        const lastBet = this.betHistory.pop();
        if (lastBet && this.session) {
            this.session.player.bet -= lastBet;
            this.session.player.balance += lastBet;
        }
    }

    public clearBets(): void {
        while (this.betHistory.length > 0) {
            this.undoBet();
        }
    }
}
