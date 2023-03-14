export enum CardValue {
  ACE = 'A',
  J = 'J',
  Q = 'Q',
  K = 'K',
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
}
export enum Suit {
  Spades = 'spades',
  Diamonds = 'diamonds',
  Clubs = 'clubs',
  Hearts = 'hearts',
}
export type PlayerInstance = {
  readonly playerID: PlayerID;
  readonly roomID: RoomID;
  cards: Card[];
  bet: number;
  balance: number;
  points: number;
};
export type DealerInstance = {
  cards: Card[];
  hasHole: boolean;
  holeCard?: Card;
  points: number;
};

export interface GameSession {
  roomID: RoomID;
  player: PlayerInstance;
  dealer: Omit<DealerInstance, 'holeCard'>;
}

export type RoomID = string;
export type PlayerID = string;

export type Room = [string, Set<string>];

export type Card = { value: CardValue; suit: string; id: string };
export type Deck = Card[];

export enum Decision {
  HIT = 'hit',
  STAND = 'stand',
}

export const WinCoefficient = {
  '3:2': 1.5,
  '1:1': 1,
};
