export enum NotificationVariant {
    Blackjack = "Blackjack",
    StandOrTakeMoney = "StandOrTakeMoney",
    Disconnection = "Disconnection",
    GameError = "GameError",
}

export type Notification = {
  variant: NotificationVariant;
  text: string;
};
