import { IPlayersStore, PlayerID } from "../types/index.js";

type PStore = Record<PlayerID, number>;

class PlayersStore implements IPlayersStore {
    private store: PStore;

    public constructor() {
        this.store = {};
    }

    public isNewPlayer(playerID: PlayerID): boolean {
        return !(this.store[playerID]);
    }

    public updatePlayerBalance({ playerID, balance }: { playerID: PlayerID; balance: number; }): void {
        this.store[playerID] = balance;
    }

    public removePlayer(playerID: PlayerID): void {
        if (this.store[playerID]) {
            delete this.store[playerID];
        } else {
            console.log("there is no such player");
        }
    }

    public getPlayerBalance(playerID: PlayerID): number {
        return this.store[playerID];
    }
}

export const PlayerStore = new PlayersStore();
