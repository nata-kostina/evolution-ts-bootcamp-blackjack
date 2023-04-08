import { PlayerID } from "../types";

type PStore = Record<PlayerID, number>;
export interface IPlayersStore {
    isNewPlayer(playerID: PlayerID): boolean;
    updatePlayerBalance({playerID, balance}: {playerID: PlayerID, balance: number}): void;
    removePlayer(playerID: PlayerID): void;
    getPlayerBalance(playerID: PlayerID): number;
}

class PlayersStore implements IPlayersStore {
  private store: PStore;

  constructor() {
    this.store = {};
  }

  public isNewPlayer(playerID: PlayerID): boolean {
    return !(this.store[playerID]);
  }

  public updatePlayerBalance({playerID, balance}: {playerID: PlayerID, balance: number}): void {
    this.store[playerID] = balance;
  }

  public removePlayer(playerID: PlayerID): void {
    if (this.store[playerID]) {
      delete this.store[playerID];
    } else {
      console.log('there is no such player');
    }
  }

  public getPlayerBalance(playerID: PlayerID): number {
      return this.store[playerID];
  }
}

export const PlayerStore = new PlayersStore();
