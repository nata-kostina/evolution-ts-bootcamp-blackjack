import { useEffect } from "react";
import { useGame } from "../context/GameContext";

export const useNotification = () => {
    const game = useGame();
    const isOpen = game.ui.isModalShown();
    const modalVariant = game.ui.getCurrentModal();
    const notificationQueue = game.ui.getModalQueue();
    const closeModal = () => {
        game.ui.hideNotification();
    };

    useEffect(() => {
        if (notificationQueue.length > 0) {
            game.ui.showNotification();
        }
    }, [notificationQueue]);

    // useEffect(() => {
    //     game.ui.addNotificationModal({
    //         type: ModalKinds.YesNo,
    //         notification: {
    //             variant: NotificationVariant.StandOrTakeMoney,
    //             text: "Take Money?",
    //         },
    //     });
    // }, []);
    return ({
        closeModal,
        isOpen,
        modalVariant,
    });
};
