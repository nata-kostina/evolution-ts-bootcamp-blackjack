import { makeAutoObservable } from "mobx";
import { Connection } from "./Connection";

export class Player {
    public balance = 0;
    public bet = 0;
    public betHistory: number[] = [];
    public connection: Connection;

    public constructor(connection: Connection) {
        this.connection = connection;
        makeAutoObservable(this);
    }

    public addBet(bet: number): void {
        this.bet += bet;
        this.balance -= bet;
        this.betHistory.push(bet);
    }

    public undoBet(): void {
        const lastBet = this.betHistory.pop();
        if (lastBet) {
            this.bet -= lastBet;
            this.balance += lastBet;
        }
    }

    public clearBets(): void {
        while (this.betHistory.length > 0) {
            this.undoBet();
        }
    }
}
