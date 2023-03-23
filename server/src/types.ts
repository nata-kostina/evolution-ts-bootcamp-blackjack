import { SpecificID, YesNoAcknowledgement } from './types/socketTypes.js';
import { GameState } from './types/storeTypes.js';
import { RoomID, PlayerID, Decision, PlayerInstance, DealerInstance } from './types/gameTypes.js';
import { Socket } from 'socket.io';
import { Notification } from './types/notificationTypes.js';
import { RespondFn } from './utils/respondConfig.js';

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

export interface Controller {
  socket: Socket;
  respond: RespondFn;
  handleStartGame: ({ playerID, socket }: { playerID: PlayerID; socket: Socket }) => void;
  handlePlaceBet: ({ playerID, roomID, bet }: SpecificID & { bet: number }) => void;
  notificate: (payload: {
    roomID: RoomID;
    notification: Notification;
    acknowledge?: (ack: YesNoAcknowledgement) => void;
  }) => void;
  dealCards: ({ playerID, roomID }: SpecificID) => void;
  changeRespond: (value: RespondFn) => void;
}
