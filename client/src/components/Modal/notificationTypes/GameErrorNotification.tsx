import React from "react";
import { OkCloseNotificationModal } from "../modalTypes/OkModal";
import { Connection } from "../../../stores/Connection";
import { useConnection } from "../../../context/ConnectionContext";
import { GameMode } from "../../../types/game.types";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const GameErrorNotification = ({ isOpen, closeModal }: Props) => {
    const connection = useConnection() as Connection;

    const handleOkClick = () => {
        const playerID: string | null = localStorage.getItem("player_id");

        connection.sendRequest<"initGame">({
            event: "initGame",
            payload: [{ playerID, mode: GameMode.Single }],
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
