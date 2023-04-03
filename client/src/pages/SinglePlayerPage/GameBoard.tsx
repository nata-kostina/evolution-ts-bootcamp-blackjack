import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ControlPanel } from "../../components/ControlPanel/ControlPanel";
import { NotificationModal } from "../../components/Modal/notification/NotificationModal";
import { changeStatus } from "../../utils/controller/changeStatus";
import { game } from "../../store";
import { Table } from "../../components/Table/Table";

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
        if (game.ui.notification.currentModal) {
            const { variant } = game.ui.notification.currentModal.notification;
            const updatedStatus = changeStatus(game.status, variant);
            game.updateStatus(updatedStatus);
        }
        game.ui.notification.hideNotification();
    };
    return (
        <div>
            <NotificationModal
                closeModal={closeModal}
                isOpen={game.ui.notification.isShown}
                modalVariant={game.ui.notification.currentModal}
            />
            <ControlPanel />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Table />
            </div>
        </div>
    );
});
