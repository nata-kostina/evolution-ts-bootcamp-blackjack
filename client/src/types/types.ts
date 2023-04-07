export type PlaceBetParams = { roomID: string; playerID: string; bet: string; };
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

export type ModalVariant = "gameError" | "playerError";

export interface ErrorModalProps {
    modalIsOpen: boolean;
    closeModal: () => void;
}

export type ChipItem = { id: string; value: number; img: string; };
type PlayerID = string;
type RoomID = string;

export type PlayerInstance = {
    readonly playerID: PlayerID;
    readonly roomID: RoomID;
    cards: Card[];
    bet: number;
    balance: number;
    points: number;
    insurance?: number;
    availableActions: Action[];
};

export type DealerInstance = {
    cards: Card[];
    points: number;
    hasHoleCard: boolean;
};

export enum GameError {
    GameError = "game-error",
    PlayerError = "player-error",
}

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

export type GameStatus =
  | "starting"
  | "started"
  | "in_progress"
  | "finished"
  | "error"
  | "waiting-decision"
  | "waiting-bet"
  | "waits-for-dealer"
  | "waiting-cards"
  | "placing-bet"
  | "waiting-others"
  | "new-game"
  | "loading";

export enum NotificationVariant {
    PlaceBet = "place-bet",
    MakeDecision = "make-decision",
    Blackjack = "blackjack",
    StandOrTakeMoney = "stand-or-take-money",
    Victory = "victory",
    Finish = "finish",
    PlayerLose = "player-lose",
    Double = "double",
    Insurance = "insurance",
    Disconnection = "disconnection",
    Move = "move",
}

export type Notification = {
    // kind: NotificationKind;
    variant: NotificationVariant;
    text: string;
};

export const enum ModalKinds {
    YesNo = "yes-no",
    Ok = "ok",
    Disappearing = "disappearing",
}

export type YesNoModal = {
    type: ModalKinds.YesNo;
    notification: Notification;
};

export type OkModal = {
    type: ModalKinds.Ok;
    notification: Notification;
};

export type DisappearingModal = {
    type: ModalKinds.Disappearing;
    notification: Notification;
};

export type ModalUnion = YesNoModal | OkModal | DisappearingModal;

export enum NotificationKind {
    YesNo = "yes-no",
    Ok = "ok",
    Move = "move",
}
export type YesNoAcknowledgement = "yes" | "no";

export enum GameMode {
    Single = "single",
    Multi = "multi",
}

export type Bet = number;

export type Acknowledgment<T> = { playerID: PlayerID; answer: T; };
export type AvailableActions = Action[];
export type HoleCard = { id: string; };

export type NewCard = {
    target: "dealer" | "player";
    card: Card | HoleCard;
    points: number;
};

export enum SocketStatus {
    Disconnected = "disconnected",
    Connected = "connected",
    Waiting = "waiting",
    WithError = "error",
}

export interface ContextProviderProps {
    children: React.ReactNode;
}

export type ActionBtn = {
    action: Action;
    svgPath: string;
};

export type BetActionBtn = {
    action: BetAction;
    svgPath: string;
};

export type MatrixProps = {
    map: Cell[];
    size: number;
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
};

export interface CanvasElement {
    update: (data: MatrixProps) => void;
}

export type Cell = "0" | "chips" | "player-seat" | "dealer-seat" | "dealer-points" | "player-points" | "bet";

export enum CardAnimation {
    Deal = "Deal",
    Remove = "Remove",
}
