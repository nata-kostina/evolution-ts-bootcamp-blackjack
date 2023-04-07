import React from "react";
import { observer } from "mobx-react-lite";
import { useConnection } from "../../../context/ConnectionContext";
import { YesNoAcknowledgement } from "../../../types/types";
import { YesNoNotificationModal } from "./YesNoModal";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const TakeMoneyOrStandNotification = observer(({ isOpen, closeModal }: Props) => {
    const connection = useConnection();
    const connectionID = connection.getConncetionID();
    const roomID = connection.getRoomID();

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
