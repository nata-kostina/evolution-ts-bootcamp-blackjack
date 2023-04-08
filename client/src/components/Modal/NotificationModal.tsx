import React from "react";
import { Notification, NotificationVariant } from "../../types/notification.types";
import { TakeMoneyOrStandNotification } from "./notificationTypes/TakeMoneyOrStandNotification";

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
        default:
            return <></>;
    }
};
