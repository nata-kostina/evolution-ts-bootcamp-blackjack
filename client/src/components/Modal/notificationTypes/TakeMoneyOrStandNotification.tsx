import React from "react";
import { observer } from "mobx-react-lite";
import { useConnection } from "../../../context/ConnectionContext";
import { YesNoNotificationModal } from "../modalTypes/YesNoModal";
import { YesNoAcknowledgement } from "../../../types/notification.types";
import { useGame } from "../../../context/GameContext";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const TakeMoneyOrStandNotification = observer(
    ({ isOpen, closeModal }: Props) => {
        const connection = useConnection();
        const roomID = connection?.roomID;
        const game = useGame();
        const playerID = game?.playerID;
        const handleAnswer = (response: YesNoAcknowledgement) => {
            if (playerID && roomID) {
                connection.sendRequest<"takeMoneyDecision">({
                    event: "takeMoneyDecision",
                    payload: [{ playerID, roomID, response }],
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
    },
);
