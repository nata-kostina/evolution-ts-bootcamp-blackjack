export enum CardValue {
    ACE = "A",
    J = "J",
    Q = "Q",
    K = "K",
    TWO = "2",
    THREE = "3",
    FOUR = "4",
    FIVE = "5",
    SIX = "6",
    SEVEN = "7",
    EIGHT = "8",
    NINE = "9",
    TEN = "10",
}
export enum Suit {
    Spades = "S",
    Diamonds = "D",
    Clubs = "C",
    Hearts = "H",
}
export type Card = { value: CardValue; suit: Suit; id: string; };
export type Deck = Card[];

export type ChipItem = { id: string; value: number; img: string; };

export type Bet = number;

export type RoomID = string;
export type PlayerID = string;

export type PlayerInstance = {
    readonly playerID: PlayerID;
    readonly roomID: RoomID;
    cards: Card[];
    bet: Bet;
    balance: number;
    points: number;
    insurance: number;
    availableActions: Action[];
};

export type DealerInstance = {
    cards: Card[];
    points: number;
    hasHoleCard: boolean;
};

export interface GameSession {
    roomID: RoomID;
    players: Record<PlayerID, PlayerInstance>;
    dealer: DealerInstance;
}
export enum Action {
    HIT = "hit",
    STAND = "stand",
    DOUBLE = "double",
    SURENDER = "surender",
    INSURANCE = "insurance",
    BET = "bet",
}

export enum BetAction {
    Undo = "undo",
    Reset = "reset",
}

export enum GameMode {
    Single = "single",
    Multi = "multi",
}

export type AvailableActions = Action[];
export type HoleCard = { id: string; };

export type NewCard = {
    target: "dealer" | "player";
    card: Card | HoleCard;
    points: number;
};
