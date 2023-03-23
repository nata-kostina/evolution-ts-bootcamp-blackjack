import { DecisionRequest } from '../types.js';
import { Notification } from './notificationTypes.js';
import { Decision, GameSession, PlayerID, PlayerInstance, RoomID } from './gameTypes.js';

export type ResponseParameters<Event extends keyof ServerToClientEvents> = {
  event: Event;
  response: Parameters<ServerToClientEvents[Event]>;
  roomID: RoomID;
};

export interface ServerToClientEvents {
  startGame: (response: SocketResponse<GameSession>) => void;
  getPlayer: (response: SocketResponse<PlayerInstance>) => void;
  finishGame: (response: SocketResponse<PlayerInstance>) => void;
  placeBet: (response: SocketResponse<GameSession>) => void;
  makeDecision: (response: SocketResponse<GameSession>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDecision: (response: SocketResponse<string>, acknowledgement: (err: any, responses:{ playerID: PlayerID; ack: Decision; }[]) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  notificate: (
    response: SocketResponse<Notification>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ack?: (err: any, responses: Acknowledgment[]) => void
  ) => void;
  updateSession: (response: SocketResponse<GameSession>) => void;
  finishRound: (response: SocketResponse<GameSession>) => void;
  waitOthers: (response: SocketResponse<GameSession>) => void;
  //   sendPlayerbalance: (response: SocketResponse<GameSession>) => void;
}

export interface ClientToServerEvents {
  startGame: (payload: { playerID: PlayerID; mode: GameMode }) => void;
  getPlayer: (id: SpecificID) => void;
  finishGame: (id: SpecificID) => void;
  placeBet: ({ playerID, roomID, bet, mode }: SpecificID & { bet: number; mode: GameMode }) => void;
  makeDecision: (decision: DecisionRequest) => void;
  insurance: (payload: SpecificID & { accept: boolean }) => void;
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

export type Acknowledgment = { playerID: PlayerID; answer: YesNoAcknowledgement };
