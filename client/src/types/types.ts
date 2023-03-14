export type PlaceBetParams = { roomID: string; playerID: string; bet: string; };
export type Card = { value: string; suit: string; id: string; };
export type Deck = Card[];

export type ModalVariant = "gameError" | "playerError";

export interface ErrorModalProps {
    type: GameError;
    modalIsOpen: boolean;
    closeModal: () => void;
}

export type BetItem = { id: string; value: number; };
type PlayerID = string;
type RoomID = string;

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
    points: number;
    hasHole: boolean;
};

export enum GameError {
    GameError = "game-error",
    PlayerError = "player-error",
}

export enum Turn {
    Player = "player",
    Dealer = "dealer",
}

export enum PlayerCommand {
    InitPlayer = "init-player",
    ToggleTurn = "toggle-turn",
    PlacingBet = "placing-bet",
    PlaceBet = "place-bet",
    GetCard = "get-card",
}
export enum DealerCommand {
    // Init = "init",
    // PlaceBet = "place-bet",
    GiveCard = "get-card",
}

export enum ECommand {
    GET_CARDS = "get-cards",
    Waiting = "waiting",
    Check_combination = "check-combination",
}

export type Command = PlayerCommand | DealerCommand;

export interface GameSession {
    roomID: RoomID;
    player: PlayerInstance;
    dealer: DealerInstance;
}

export enum SeatPlace {
    Left = "left",
    MiddleLeft = "middle-left",
    MiddleRight = "middle-right",
    Right = "right",
    Dealer = "dealer",
}

export enum Decision {
    HIT = "hit",
    STAND = "stand",
}

export type GameStatus = "starting" | "started" | "in_progress" | "finished" | "error" | "waiting-decision" |
"waiting-bet" | "waits-for-dealer" | "waiting-cards" | "placing-bet";

export enum NotificationVariant {
    PlaceBet = "place-bet",
    MakeDecision = "make-decision",
    Blackjack = "blackjack",
    StandOrTakeMoney = "stand-or-take-money",
    Victory = "victory",
    Finish = "finish",
}
export type Notification = {
    type: NotificationVariant;
    text: string;
};

export const enum ModalKinds {
    YesNo = "yes-no",
    Ok = "ok",
    Disappearing = "disappearing",
}

export type YesNoModal = {
    type: ModalKinds.YesNo;
    text: string;
    positiveCallback: (() => void);
    negativeCallback: (() => void);
};

export type OkModal = {
    type: ModalKinds.Ok;
};

export type DisappearingModal = {
    type: ModalKinds.Disappearing;
    text: string;
    timer?: number;
};

export type ModalUnion = YesNoModal | OkModal | DisappearingModal;
