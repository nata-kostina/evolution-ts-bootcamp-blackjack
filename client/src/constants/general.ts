import { GameErrorModal } from "../components/Modal/GameErrorModal";
import { PlayerErrorModal } from "../components/Modal/PlayerErrorModal";
import { NotificationVariant } from "../types/types";

export const ModalMap = {
    gameError: GameErrorModal,
    playerError: PlayerErrorModal,
};

export const OkNotifications = new Set([
    NotificationVariant.Blackjack,
    NotificationVariant.Double,
    NotificationVariant.MakeDecision,
    NotificationVariant.Insurance,
    NotificationVariant.PlaceBet,
    NotificationVariant.Victory,
    NotificationVariant.Disconnection,
    NotificationVariant.Finish,
]);

export const YesNoNotifications = new Set([
    NotificationVariant.Insurance,
    NotificationVariant.StandOrTakeMoney,
]);
