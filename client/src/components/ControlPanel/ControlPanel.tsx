import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Balance } from "../Balance/Balance";
// import { BetsForm } from "../BetsForm/BetsForm";
import { PlayerActions } from "../PlayerActions/PlayerActions";
import "./styles.css";
import { game } from "../../store";
import { NotificationModal } from "../Modal/notification/NotificationModal";

const notificationDelay = 200;

export const ControlPanel = observer(() => {
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
        if (game.ui.notification.currentModal) {
            // const { variant } = game.ui.notification.currentModal.notification;
            // const updatedStatus = changeStatus(game.status, variant);
            // game.updateStatus(updatedStatus);
        }
        game.ui.notification.hideNotification();
    };
    return (
        <>
            <div className="controlPanel">

                <Balance />
                {/* <BetsForm /> */}
                <PlayerActions />
            </div>
            <NotificationModal
                closeModal={closeModal}
                isOpen={game.ui.notification.isShown}
                modalVariant={game.ui.notification.currentModal}
            />
        </>
    );
});
