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

export type ChipItem = { id: string; name: string; value: number; img: string; };

export type RoomID = string;
export type PlayerID = string;

export type Hand = {
    handID: string;
    parentID: string;
    cards: Card[];
    bet: number;
    points: Array<number>;
};

export type PlayerInstance = {
    readonly playerID: PlayerID;
    readonly roomID: RoomID;
    bet: number;
    balance: number;
    insurance: number;
    hands: Array<Hand>;
    activeHandID: string;
    availableActions: Action[];
    seat?: Seat;
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
    Hit = "Hit",
    Stand = "Stand",
    Double = "Double",
    Surrender = "Surrender",
    Insurance = "Insurance",
    Split = "Split",
    Bet = "Bet",
}

export enum BetAction {
    Undo = "undo",
    Reset = "reset",
    Rebet = "rebet",
    AllIn = "All in",
}

export enum GameMode {
    Single = "single",
    Multi = "multi",
}

export type AvailableActions = Action[];
export type HoleCard = { id: string; };

export type DealDealerCard = {
    target: "dealer";
    card: Card | HoleCard;
    points: number;
};

export type DealPlayerCard = {
    target: "player";
    card: Card;
    points: Array<number>;
    handID: string;
    playerID: PlayerID;
};

export enum GameResult {
    Win = "win",
    Lose = "lose",
}

export enum Seat {
    Left = "Left",
    Middle = "Middle",
    Right = "Right,",
}
