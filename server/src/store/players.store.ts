import { IPlayersStore, PlayerID } from "../types/index.js";

type PStore = Record<PlayerID, number>;

export class PlayersStore implements IPlayersStore {
    private _store: PStore;

    public constructor() {
        this._store = {};
    }

    public get store(): PStore {
        return this._store;
    }

    public isNewPlayer(playerID: PlayerID): boolean {
        return !(this._store[playerID]);
    }

    public updatePlayerBalance({ playerID, balance }: { playerID: PlayerID; balance: number; }): void {
        this._store[playerID] = balance;
    }

    public removePlayer(playerID: PlayerID): void {
        if (this._store[playerID]) {
            delete this._store[playerID];
        } else {
            console.log("there is no such player");
        }
    }

    public getPlayerBalance(playerID: PlayerID): number {
        return this._store[playerID];
    }
}

export const PlayerStore = new PlayersStore();
