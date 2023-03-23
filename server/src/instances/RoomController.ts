import { store } from '../index.js';
import { PlayerID, RoomID } from '../types/gameTypes.js';

export interface RoomController {
    callOnce: (playerID: PlayerID, callback: () => void) => void;
}

export const initializeRoomController = (roomID: RoomID): RoomController => {
  return {
    callOnce: (() => {
      return (playerID: PlayerID, callback: () => void) => {
        const { organizer } = store.getGame(roomID);
        if (organizer === playerID) {
          callback();
        }
      };
    })(),  
  };
};
