import { Notification, NotificationVariant } from "../types"

export const PlaceBetNotification: Notification = {
    variant: NotificationVariant.PlaceBet,
    text: "Place your bet please",
}
export const CardsDealtPlaceBetNotification: Notification = {
    variant: NotificationVariant.PlaceBet,
    text: "Place your bet please",
}
export const MakeDecisionNotification: Notification = {
    variant: NotificationVariant.MakeDecision,
    text: "Your move",
}
export const MoveNotification: Notification = {
    variant: NotificationVariant.Move,
    text: "!move!",
}
export const DisconnectionNotification: Notification = {
    variant: NotificationVariant.Disconnection,
    text: "Your have been disconnected from a room",
}
export const BlackjackNotification: Notification = {
    variant: NotificationVariant.Blackjack,
    text: "You have blackjack!",
}

export const TakeMoneyNotification: Notification = {
    variant: NotificationVariant.StandOrTakeMoney,
    text: "Do you want to take money?",
}
export const NewGameNotification: Notification = {
    variant: NotificationVariant.NewGame,
    text: "New game?",
}

export const VictoryNotification: Notification = {
    variant: NotificationVariant.Victory,
    text: "Congrats!",
}

export const PlayerLoseNotification: Notification = {
    variant: NotificationVariant.PlayerLose,
    text: "you lose :(",
}

export const DoubleNotification: Notification = {
    variant: NotificationVariant.Double,
    text: "You can double",
}

export const InsuranceNotification: Notification = {
    variant: NotificationVariant.Insurance,
    text: "Insurance?",
}
