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
    insurance?: number;
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

// export enum SeatPlace {
//     Left = "left",
//     MiddleLeft = "middle-left",
//     MiddleRight = "middle-right",
//     Right = "right",
// }

export type SeatPlace = "left" | "middle-left" | "middle-right" | "right";

export enum Decision {
    HIT = "hit",
    STAND = "stand",
    Double = "double",
    Surender = "surender",
    TakeMoney = "take-money",
    DenyMoney = "deny-money",
}

export type GameStatus = "starting" | "started" | "in_progress" | "finished" | "error" | "waiting-decision" |
"waiting-bet" | "waits-for-dealer" | "waiting-cards" | "placing-bet" | "waiting-others" | "new-game";

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
    kind: NotificationKind;
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
    handleAnswer: (answer: YesNoAcknowledgement) => void;
};

export type OkModal = {
    type: ModalKinds.Ok;
    notification: Notification;

};

export type DisappearingModal = {
    type: ModalKinds.Disappearing;
    notification: Notification;
    timer?: number;
    handleAnswer?: (answer: Decision) => void;
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
