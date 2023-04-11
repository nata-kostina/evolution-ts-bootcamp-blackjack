import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import { Game } from "../stores/Game";

export const useModal = () => {
    const game = useGame() as Game;
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
