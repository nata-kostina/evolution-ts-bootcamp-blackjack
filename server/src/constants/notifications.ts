import { Notification, NotificationVariant } from "../types/notificationTypes.js"

export enum NotificationKind {
    YesNo = "yes-no",
    Ok = "ok",
    Move = "move",
}

export const PlaceBetNotification: Notification = {
    variant: NotificationVariant.PlaceBet,
    kind: NotificationKind.Ok,
    text: "Place your bet please",
}
export const CardsDealtPlaceBetNotification: Notification = {
    variant: NotificationVariant.PlaceBet,
    kind: NotificationKind.Ok,
    text: "Place your bet please",
}
export const MakeDecisionNotification: Notification = {
    kind: NotificationKind.Ok,
    variant: NotificationVariant.MakeDecision,
    text: "Your move",
}
export const MoveNotification: Notification = {
    kind: NotificationKind.Move,
    variant: NotificationVariant.Move,
    text: "!move!",
}
export const DisconnectionNotification: Notification = {
    kind: NotificationKind.Ok,
    variant: NotificationVariant.Disconnection,
    text: "Your have been disconnected from a room",
}
export const BlackjackNotification: Notification = {
    kind: NotificationKind.Ok,
    variant: NotificationVariant.Blackjack,
    text: "You have blackjack!",
}

export const TakeMoneyNotification: Notification = {
    kind: NotificationKind.YesNo,
    variant: NotificationVariant.StandOrTakeMoney,
    text: "Do you want to take money?",
}
export const NewGameNotification: Notification = {
    kind: NotificationKind.YesNo,
    variant: NotificationVariant.NewGame,
    text: "New game?",
}

export const VictoryNotification: Notification = {
    kind: NotificationKind.Ok,
    variant: NotificationVariant.Victory,
    text: "Congrats!",
}

export const PlayerLoseNotification: Notification = {
    kind: NotificationKind.Ok,
    variant: NotificationVariant.PlayerLose,
    text: "you lose :(",
}

export const DoubleNotification: Notification = {
    kind: NotificationKind.Ok,
    variant: NotificationVariant.Double,
    text: "You can double",
}

export const InsuranceNotification: Notification = {
    kind: NotificationKind.YesNo,
    variant: NotificationVariant.Insurance,
    text: "Insurance?",
}
