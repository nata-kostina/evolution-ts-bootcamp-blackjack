import { NotificationVariant } from "../types/notification.types";

export const OkNotifications = new Set([
    NotificationVariant.Blackjack,
    NotificationVariant.Double,
    NotificationVariant.Insurance,
    NotificationVariant.Victory,
    NotificationVariant.Disconnection,
    NotificationVariant.Finish,
]);

export const YesNoNotifications = new Set([
    NotificationVariant.Insurance,
    NotificationVariant.StandOrTakeMoney,
]);
