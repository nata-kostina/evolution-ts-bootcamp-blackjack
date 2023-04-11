import React from "react";
import { observer } from "mobx-react-lite";
import { useConnection } from "../../../context/ConnectionContext";
import { YesNoNotificationModal } from "../modalTypes/YesNoModal";
import { YesNoAcknowledgement } from "../../../types/notification.types";
import { Connection } from "../../../stores/Connection";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const TakeMoneyOrStandNotification = observer(({ isOpen, closeModal }: Props) => {
    const connection = useConnection() as Connection;
    const connectionID = connection.connectionID;
    const roomID = connection.roomID;

    const handleAnswer = (response: YesNoAcknowledgement) => {
        if (connectionID && roomID) {
            connection.sendRequest<"takeMoneyDecision">({
                event: "takeMoneyDecision",
                payload: [{ playerID: connectionID, roomID, response }],
            });
        }
    };
    return (
        <YesNoNotificationModal
            text="Would you like to take money?"
            onClose={closeModal}
            isOpen={isOpen}
            handleAnswer={handleAnswer}
        />
    );
});
