import { GameStatus, NotificationVariant } from "../../types/types";

export const changeStatus = (
    prevStatus: GameStatus,
    notification: NotificationVariant,
): GameStatus => {
    switch (notification) {
        case NotificationVariant.PlaceBet:
            return "waiting-bet";
        case NotificationVariant.MakeDecision:
            return "waiting-decision";
        case NotificationVariant.Move:
            return "waiting-decision";
        case NotificationVariant.Disconnection:
            return "new-game";
        default:
            return prevStatus;
    }
};
