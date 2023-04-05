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
  Spades = 'S',
  Diamonds = 'D',
  Clubs = 'C',
  Hearts = 'H',
}
export type PlayerInstance = {
  readonly playerID: PlayerID;
  readonly roomID: RoomID;
  cards: Card[];
  bet: number;
  balance: number;
  points: number;
  insurance?: number;
  availableActions: Action[],
};
export type DealerInstance = {
  cards: Card[];
  hasHoleCard: boolean;
  holeCard?: Card;
  points: number;
};

export interface GameSession {
  roomID: RoomID;
  players: Record<PlayerID, PlayerInstance>;
  dealer: Omit<DealerInstance, 'holeCard'>;
}

export type RoomID = string;
export type PlayerID = string;

export type Room = [string, Set<string>];

export type Card = { value: CardValue; suit: Suit; id: string };
export type Deck = Card[];

export enum Action {
    HIT = "hit",
    STAND = "stand",
    DOUBLE = "double",
    SURENDER = "surender",
}
export const WinCoefficient = {
  '3:2': 1.5,
  '1:1': 1,
  'even': 0,
};

export type Bet = number;
