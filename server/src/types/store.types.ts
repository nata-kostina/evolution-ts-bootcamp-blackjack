import { RoomID, Deck, PlayerInstance, DealerInstance, PlayerID } from "./game.types.js";

export interface GameState {
    roomID: RoomID;
    hasStarted: boolean;
    organizer: PlayerID;
    deck: Deck;
    players: Record<PlayerID, PlayerInstance>;
    dealer: DealerInstance;
    dealNum: number;
  }
  
  export type State = Record<RoomID, GameState>;

  export type UpdatePlayerParams = {
    playerID: PlayerID;
    roomID: RoomID;
    payload: { [key in keyof Partial<Omit<PlayerInstance, 'playerID' | 'roomID'>>]: PlayerInstance[key] };
  };
  
  export type UpdateDealerParams = {
    roomID: RoomID;
    payload: { [key in keyof Partial<DealerInstance>]: DealerInstance[key] };
  };