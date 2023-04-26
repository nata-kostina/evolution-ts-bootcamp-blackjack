import React from "react";
import { Notification, NotificationVariant } from "../../types/notification.types";
import { GameErrorNotification } from "./notificationTypes/GameErrorNotification";
import { ServerErrorNotification } from "./notificationTypes/ServerErrorNotification";
import { TakeMoneyOrStandNotification } from "./notificationTypes/TakeMoneyOrStandNotification";
import { WaitingNotification } from "./notificationTypes/WaitingNotification";
import { PlaceBetNotification } from "./notificationTypes/PlaceBetNotification";
import { BlackjackNotification } from "./notificationTypes/BlackjackNotification";

interface Props {
    notification: Notification | null;
    isOpen: boolean;
    closeModal: () => void;
}

export const NotificationModal = ({ isOpen, notification, closeModal }: Props) => {
    if (!notification) { return null; }

    switch (notification.variant) {
        case NotificationVariant.StandOrTakeMoney:
            return <TakeMoneyOrStandNotification isOpen={isOpen} closeModal={closeModal} />;
        case NotificationVariant.Disconnection:
            return <ServerErrorNotification isOpen={isOpen} closeModal={closeModal} />;
        case NotificationVariant.GameError:
            return <GameErrorNotification isOpen={isOpen} closeModal={closeModal} />;
        case NotificationVariant.WaitingPlayers:
            return <WaitingNotification isOpen={isOpen} closeModal={closeModal} />;
        case NotificationVariant.PlaceBet:
            return <PlaceBetNotification isOpen={isOpen} closeModal={closeModal} />;
        case NotificationVariant.Blackjack:
            return <BlackjackNotification isOpen={isOpen} closeModal={closeModal} />;
        default:
            return <></>;
    }
};
