import { RoomController } from "../instances/RoomController.js";
import { RoomID, Deck, PlayerInstance, DealerInstance, PlayerID } from "./gameTypes.js";

export interface GameState {
    roomID: RoomID;
    controller: RoomController,
    hasStarted: boolean;
    organizer: PlayerID;
    deck: Deck;
    players: Record<PlayerID, PlayerInstance>;
    dealer: DealerInstance;
    dealNum: number;
  }
  
  export type State = Record<RoomID, GameState>;
  