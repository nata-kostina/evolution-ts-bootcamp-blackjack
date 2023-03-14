import { store } from '..';
import { PlayerID, RoomID } from '../types/gameTypes.js';
import { SpecificID } from '../types/socketTypes.js';

export class Player {
  public playerID: PlayerID;
  public roomID: RoomID;

  constructor({ playerID, roomID }: SpecificID) {
    this.playerID = playerID;
    this.roomID = roomID;
  }
  public handleVictory(coefficient: number) {
    try {
      const player = store.getPlayer({ playerID: this.playerID, roomID: this.roomID });
      const winAmount = player.bet + player.bet * coefficient;
      store.updatePlayer({ playerID: this.playerID, roomID: this.roomID, payload: { balance: player.balance + winAmount, bet: 0 } });
    //   this.respond({
    //     socket: this.connection,
    //     event: 'notificate',
    //     payload: [successResponse<Notification>(VictoryNotification)],
    //   });
    } catch (e) {
      throw new Error('Fail to handle player victory');
    }
  }
}
