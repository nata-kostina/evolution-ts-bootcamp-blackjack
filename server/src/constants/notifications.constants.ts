import { Notification, NotificationVariant } from "../types/index.js"

export const BlackjackNotification: Notification = {
    variant: NotificationVariant.Blackjack,
    text: "You have blackjack!",
}

export const TakeMoneyNotification: Notification = {
    variant: NotificationVariant.StandOrTakeMoney,
    text: "Do you want to take money?",
}
export const WaitPlayesNotification: Notification = {
    variant: NotificationVariant.WaitingPlayers,
    text: "Waiting other players to connect...",
}
export const PlaceBetNotification: Notification = {
    variant: NotificationVariant.PlaceBet,
    text: "Waiting other players to connect...",
}
