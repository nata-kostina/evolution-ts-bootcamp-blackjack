export enum NotificationVariant {
    Blackjack = "Blackjack",
    StandOrTakeMoney = "StandOrTakeMoney",
    Disconnection = "Disconnection",
    GameError = "GameError",
    WaitingPlayers = "WaitingPlayers",
    GameStart = "GameStart",
    PlaceBet = "PlaceBet",
}

export type Notification = {
    variant: NotificationVariant;
    text: string;
};
