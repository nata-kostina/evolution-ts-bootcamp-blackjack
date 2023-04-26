import React from "react";
import { OkCloseNotificationModal } from "../modalTypes/OkModal";
import { useConnection } from "../../../context/ConnectionContext";
import { GameMode } from "../../../types/game.types";
import { useGame } from "../../../context/GameContext";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const GameErrorNotification = ({ isOpen, closeModal }: Props) => {
    const connection = useConnection();
    const game = useGame();

    const handleOkClick = () => {
        connection?.sendRequest<"initGame">({
            event: "initGame",
            payload: [{ playerID: game?.playerID, mode: GameMode.Single }],
        });
    };
    return (
        <OkCloseNotificationModal
            text={"Ooops! Something went wrong.\n Click \"Ok\" to start a new game"}
            onClose={closeModal}
            isOpen={isOpen}
            handleOkClick={handleOkClick}
        />
    );
};
