import { Notification, NotificationVariant } from "../types/index.js"

export const BlackjackNotification: Notification = {
    variant: NotificationVariant.Blackjack,
    text: "You have blackjack!",
}

export const TakeMoneyNotification: Notification = {
    variant: NotificationVariant.StandOrTakeMoney,
    text: "Do you want to take money?",
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
