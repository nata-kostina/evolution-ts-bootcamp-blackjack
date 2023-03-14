import { Socket } from 'socket.io';
import { DecisionRequest } from '../types.js';
import { Notification } from './notificationTypes.js';
import { GameSession, PlayerID, PlayerInstance, RoomID } from './gameTypes.js';

export interface ServerToClientEvents {
  startGame: (response: SocketResponse<GameSession>) => void;
  getPlayer: (response: SocketResponse<PlayerInstance>) => void;
  finishGame: (response: SocketResponse<PlayerInstance>) => void;
  placeBet: (response: SocketResponse<GameSession>) => void;
  checkCombination: (response: SocketResponse<GameSession>) => void;
  makeDecision: (response: SocketResponse<GameSession>) => void;
  notificate: (response: SocketResponse<Notification>) => void;
  updateSession: (response: SocketResponse<GameSession>, callback?: () => void) => void;
}

export interface ClientToServerEvents {
  startGame: (room: string) => void;
  getPlayer: (id: SpecificID) => void;
  finishGame: (id: SpecificID) => void;
  placeBet: ({ playerID, roomID, bet }: SpecificID & { bet: number }) => void;
  makeDecision: (decision: DecisionRequest) => void;
  requestMoney: (id: SpecificID) => void;
}

export type ClientParams<T extends keyof ClientToServerEvents> = Parameters<ClientToServerEvents[T]>;

export type EventResponseMap<T extends keyof Partial<ServerToClientEvents>> = {
    socket: Socket,
    event: T,
    payload: Parameters<ServerToClientEvents[T]>
}

export type SocketResponse<T> = {
  ok: boolean;
  statusText: string;
  payload?: T;
};

export type SpecificID = {
    readonly roomID: RoomID;
    readonly playerID: PlayerID;
};
