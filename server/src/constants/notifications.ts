import { Notification, NotificationVariant } from "../types/notificationTypes.js"

export const PlaceBetNotification: Notification = {
    type: NotificationVariant.PlaceBet,
    text: "Place your bet please",
}
export const MakeDecisionNotification: Notification = {
    type: NotificationVariant.MakeDecision,
    text: "Your move",
}
export const BlackjackNotification: Notification = {
    type: NotificationVariant.Blackjack,
    text: "You have blackjack!",
}
export const StandOrTakeMoneyNotification: Notification = {
    type: NotificationVariant.StandOrTakeMoney,
    text: "Do you want to take money or stand?",
}
export const VictoryNotification: Notification = {
    type: NotificationVariant.Victory,
    text: "Congrats!",
}

export const RequestErrorNotification: Notification = {
    type: NotificationVariant.Victory,
    text: "Congrats!",
}