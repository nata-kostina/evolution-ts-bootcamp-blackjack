import { Acknowledgment, SpecificID, YesNoAcknowledgement } from './types/socketTypes.js';
import { GameState } from './types/storeTypes.js';
import { RoomID, PlayerID, Decision, PlayerInstance, DealerInstance, Card } from './types/gameTypes.js';
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
  handleStartGame({roomID, playerID}: SpecificID): Promise<void>;
  notificate: (payload: {
    roomID: RoomID;
    notification: Notification;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acknowledge?: (err: any, responses: Acknowledgment<YesNoAcknowledgement>[]) => void;
  }) => Promise<void>;
  startPlay({ roomID, playerID }: SpecificID): Promise<void>;
  dealCards: ({ playerID, roomID }: SpecificID) =>  Promise<void>;
  dealMockCards: ({ playerID, roomID }: SpecificID) =>  Promise<void>;
  changeRespond: (value: RespondFn) => void;
  waitPlayersToPlaceBet: ({ roomID, playerID }: SpecificID) => Promise<void>;
  checkForBlackjack({ playerID, roomID }: SpecificID): Promise<void>;
  handleBlackjack({ playerID, roomID }: SpecificID): Promise<void>;
  checkDealerFirstCard({roomID, playerID}: SpecificID): Promise<void>;
  placeInsurance({ playerID, roomID }: SpecificID): void;
  checkForDouble({roomID, playerID}: SpecificID): Promise<void>;
  playWithSinglePlayer({ playerID, roomID }: SpecificID): Promise<void>;
  handleDouble({ playerID, roomID }: SpecificID): Promise<void>;
  handleSurender({ playerID, roomID }: SpecificID): Promise<void>;
  handleHit({ playerID, roomID }: SpecificID): Promise<void>;
  checkDealerCombination({ playerID, roomID }: SpecificID): Promise<void>;
  startDealerPlay({ playerID, roomID }: SpecificID): Promise<void>;
  handlePlayerVictory({ coefficient, playerID, roomID }: SpecificID & { coefficient: number }): Promise<void>;
  handlePlayerLose({ roomID, playerID }: SpecificID): Promise<void>;
  finishRound({ playerID, roomID }: SpecificID): Promise<void>;
  finishGame({ playerID, roomID }: SpecificID): Promise<void>;
  giveInsurance({ playerID, roomID }: SpecificID): void;
  takeOutInsurance({ playerID, roomID }: SpecificID): void;
}

export type AvailableActions = Decision[];
export type NewGameMode = "new-game" | "new-round";

export type HoleCard = {id: string}

export type NewCard = {
    target: "dealer" | "player",
    card: Card | HoleCard,
    points: number,
}