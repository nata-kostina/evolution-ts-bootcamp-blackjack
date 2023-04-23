import { Notification, NotificationVariant } from "../types/index.js"

export const BlackjackNotification: Notification = {
    variant: NotificationVariant.Blackjack,
    text: "You have blackjack!",
}

export const TakeMoneyNotification: Notification = {
    variant: NotificationVariant.StandOrTakeMoney,
    text: "Do you want to take money?",
}
