import { SpecificID } from './types/socketTypes.js';
import { GameState } from './types/storeTypes.js';
import { RoomID, PlayerID, Decision, PlayerInstance, DealerInstance } from './types/gameTypes.js';

export type DecisionRequest = {
  decision: Decision;
  id: SpecificID;
};

export type UpdatePlayerParams = {
  playerID: PlayerID;
  roomID: RoomID;
  payload: { [key in keyof Partial<Omit<PlayerInstance, 'playerID' | 'roomID'>>]: PlayerInstance[key] };
};

export type UpdateGameParams = {
  roomID: RoomID;
  payload: { [key in keyof Partial<Omit<GameState, 'roomID'>>]: GameState[key] };
};

export type UpdateDealerParams = {
  roomID: RoomID;
  payload: { [key in keyof Partial<DealerInstance>]: DealerInstance[key] };
};

export type DealSingleCard = {
  roomID: RoomID;
  playerID: PlayerID;
  target: 'player' | 'dealer';
  asHoleCard?: boolean;
};
