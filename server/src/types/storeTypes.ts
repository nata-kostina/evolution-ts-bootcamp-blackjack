import { RoomID, Deck, PlayerInstance, DealerInstance } from "./gameTypes.js";


export interface GameState {
    roomID: RoomID;
    deck: Deck;
    players: PlayerInstance[];
    dealer: DealerInstance;
    dealNum: number;
  }
  
  
  export type State = Record<RoomID, GameState>;