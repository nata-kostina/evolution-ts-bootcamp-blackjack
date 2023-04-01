import { PlayerID } from '../types/gameTypes';

export type PStore = Record<PlayerID, number>;
export class PlayersStore {
  private store: PStore;

  constructor() {
    this.store = {};
  }

  public isNewPlayer(playerID: PlayerID): boolean {
    return !(this.store[playerID]);
  }

  public updatePlayerBalance({playerID, balance}: {playerID: PlayerID, balance: number}): void {
    console.log(this.store);
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
