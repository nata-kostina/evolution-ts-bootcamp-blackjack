export enum NotificationVariant {
    Blackjack = "Blackjack",
    StandOrTakeMoney = "StandOrTakeMoney",
    Disconnection = "Disconnection",
    GameError = "GameError",
    GameStart = "GameStart",
    WaitingPlayers = "WaitingPlayers",
    PlaceBet = "PlaceBet",
}

export type Notification = {
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

export type YesNoAcknowledgement = "yes" | "no";
