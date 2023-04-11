import { Notification } from './notification.types.js';
import { Bet, Action, GameSession, PlayerID, RoomID, GameMode, Card, HoleCard } from './game.types.js';

export type ResponseParameters<Event extends keyof ServerToClientEvents> = {
  event: Event;
  response: Parameters<ServerToClientEvents[Event]>;
  roomID: RoomID;
};

export interface ServerToClientEvents {
    initGame: (response: SocketResponse<{ game: GameSession, playerID: PlayerID }>) => void;
  placeBet: (response: SocketResponse<GameSession>) => void;
  updateSession: (response: SocketResponse<GameSession>) => void;
  dealCard: (response: SocketResponse<NewCard>) => void;
  notificate: (response: SocketResponse<Notification>) => void;
  unholeCard: (response: SocketResponse<UnholeCardPayload>) => void;
  finishRound: (response: SocketResponse<GameSession>) => void;
}

export interface ClientToServerEvents {
    initGame: ({ playerID, mode }: { playerID: PlayerID | null; mode: GameMode; }) => void;
  finishGame: ({ roomID, playerID }: SpecificID) => void;
  takeMoneyDecision: ({ roomID, playerID }: SpecificID & { response: YesNoAcknowledgement }) => void;
  placeBet: ({ roomID, playerID, bet }: SpecificID & { bet: Bet }) => void;
  makeDecision: ({ roomID, playerID, action }: SpecificID & { action: Action }) => void;
  startPlay: ({ roomID, playerID }: SpecificID) => void;
}

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

export enum YesNoAcknowledgement {
  Yes = 'yes',
  No = 'no',
}

export type NewCard = {
  target: 'dealer' | 'player';
  card: Card | HoleCard;
  points: number;
};

export type UnholeCardPayload = {
  target: 'dealer';
  card: Card;
  points: number;
};
