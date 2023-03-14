import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ControlPanel } from "../../components/ControlPanel/ControlPanel";
import { game, uiStore } from "../../store/index";
import { NotificationModal } from "../../components/Modal/notification/NotificationModal";

const notificationDelay = 200;

export const GameBoard = observer(() => {
    useEffect(() => {
        const timer = setTimeout(() => {
            if (game.ui.notification.queue.length > 0) {
                game.ui.notification.showNotification();
            }
        }, notificationDelay);

        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.ui.notification.queue]);

    const closeModal = () => {
        game.ui.notification.hideNotification();
    };
    return (
        <div>
            <NotificationModal
                closeModal={closeModal}
                isOpen={uiStore.notification.isShown}
                modalVariant={uiStore.notification.currentModal}
            />
            <ControlPanel />
        </div>
    );
});
