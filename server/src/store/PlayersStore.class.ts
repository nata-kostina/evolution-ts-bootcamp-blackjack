import { PlayerID } from '../types/gameTypes';

export type PStore = Record<PlayerID, number>;
export class PlayersStore {
  private store: PStore;

  constructor() {
    this.store = {};
  }

  addPlayer(playerID: PlayerID, balance: number) {
    this.store[playerID] = balance;
  }

  removePlayer(playerID: PlayerID) {
    if (this.store[playerID]) {
      delete this.store[playerID];
    } else {
      console.log('there is no such player');
    }
  }

  getPlayer(playerID: PlayerID) {
    if (this.store[playerID]) {
      return this.store[playerID];
    } else {
      return null;
    }
  }
}
