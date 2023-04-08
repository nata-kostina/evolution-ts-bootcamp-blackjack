import { useEffect } from "react";
import { useGame } from "../context/GameContext";

export const useModal = () => {
    const game = useGame();
    const isOpen = game.UI.isModalShown;
    const notification = game.UI.currentModal;
    const notificationQueue = game.UI.modalQueue;
    const closeModal = () => {
        game.UI.hideNotification();
    };

    useEffect(() => {
        if (notificationQueue.length > 0) {
            game.UI.showModal();
        }
    }, [game.UI, notificationQueue]);

    return ({
        closeModal,
        isOpen,
        notification,
    });
};
