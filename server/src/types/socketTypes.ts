/* eslint-disable @typescript-eslint/no-explicit-any */
import { AvailableActions, DecisionRequest, NewCard, NewGameMode } from '../types.js';
import { Notification } from './notificationTypes.js';
import { Bet, Action, GameSession, PlayerID, PlayerInstance, RoomID } from './gameTypes.js';

export type ResponseParameters<Event extends keyof ServerToClientEvents> = {
  event: Event;
  response: Parameters<ServerToClientEvents[Event]>;
  roomID: RoomID;
};

export interface ServerToClientEvents {
  startGame: (response: SocketResponse<GameSession>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  placeBet: (
    response: SocketResponse<GameSession>,
    acknowledgement: (err: any, responses: Acknowledgment<Bet>[]) => Promise<void>
  ) => void;
  dealCard: (response: SocketResponse<NewCard>) => void;
  getDecision: (
    response: SocketResponse<GameSession>,
    acknowledgement: (err: any, responses: Acknowledgment<Action>[]) => Promise<void>
  ) => void;
  notificate: (
    response: SocketResponse<Notification>,
    ack?: (err: any, responses: Acknowledgment<YesNoAcknowledgement>[]) => void
  ) => void;
  updateSession: (response: SocketResponse<GameSession>) => void;
  finishRound: (response: SocketResponse<GameSession>) => void;
}

export interface ClientToServerEvents {
  startGame: (payload: { playerID: PlayerID; mode: GameMode; roundMode: NewGameMode }) => void;
  finishGame: ({roomID, playerID}: SpecificID) => void;
  placeBet: ({ roomID, playerID, bet }: SpecificID & { bet: Bet; }) => void;
  makeDecision: ({ roomID, playerID, action }: SpecificID & { action: Action; }) => void;
}

export type ClientPayload<T extends keyof ClientToServerEvents> = Parameters<ClientToServerEvents[T]>[0];

export type EventResponseMap<T extends keyof Partial<ServerToClientEvents>, Ack> = {
  event: T;
  response: Parameters<ServerToClientEvents[T]>;
  acknowledge?: (ack: Ack) => void;
};
export type SuccessResponse<T> = {
  ok: true;
  statusText: string;
  payload: T;
};
export type FailedResponse = {
  ok: false;
  statusText: string;
};

export type SocketResponse<T> = SuccessResponse<T> | FailedResponse;

export type SpecificID = {
  readonly roomID: RoomID;
  readonly playerID: PlayerID;
};

export type YesNoAcknowledgement = 'yes' | 'no';

export enum GameMode {
  Single = 'single',
  Multi = 'multi',
}

export type Acknowledgment<T> = { playerID: PlayerID; answer: T };
