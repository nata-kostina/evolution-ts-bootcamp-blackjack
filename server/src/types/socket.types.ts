import { Notification } from './notification.types.js';
import { Bet, Action, GameSession, PlayerID, RoomID, GameMode, Card, HoleCard, GameResult } from './game.types.js';

export type ResponseParameters<Event extends keyof ServerToClientEvents> = {
  event: Event;
  response: Parameters<ServerToClientEvents[Event]>;
  roomID: RoomID;
  delay?: number;
};

export interface ServerToClientEvents {
  initGame: (response: SocketResponse<{ game: GameSession; playerID: PlayerID }>) => void;
  placeBet: (response: SocketResponse<GameSession>) => void;
  updateSession: (response: SocketResponse<GameSession>) => void;
  dealDealerCard: (response: SocketResponse<DealDealerCard>) => void;
  dealPlayerCard: (response: SocketResponse<DealPlayerCard>) => void;
  notificate: (response: SocketResponse<Notification>) => void;
  unholeCard: (response: SocketResponse<UnholeCardPayload>) => void;
  finishRound: (response: SocketResponse<GameSession>) => void;
  split: (response: SocketResponse<GameSession>) => void;
  finishRoundForHand: (response: SocketResponse<FinishRoundForHand>) => void;
  reassignActiveHand: (response: SocketResponse<ReassignActiveHand>) => void;
  makeDecision: (response: SocketResponse<GameSession>) => void;

}

export interface ClientToServerEvents {
  initGame: ({ playerID, mode }: { playerID: PlayerID | null; mode: GameMode }) => void;
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

export type DealDealerCard = {
  target: 'dealer';
  card: Card | HoleCard;
  points: number;
};

export type DealPlayerCard = {
  target: 'player';
  playerID: PlayerID;
  card: Card;
  points: Array<number>;
  handID: string;
};

export type UnholeCardPayload = {
  target: 'dealer';
  card: Card;
  points: number;
};

export type FinishRoundForHand = {
    roomID: RoomID,
    playerID: PlayerID,
    handID: string;
    result: GameResult;
}

export type ReassignActiveHand = {
    roomID: RoomID,
    playerID: PlayerID,
    handID: string;
}