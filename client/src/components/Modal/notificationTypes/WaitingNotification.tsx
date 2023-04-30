import React from "react";
import { observer } from "mobx-react-lite";
import { NoControlsNotificationModal } from "../modalTypes/NoControlsModal";
import styles from "../styles.module.css";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const WaitingNotification = observer(({ isOpen, closeModal }: Props) => {
    return (
        <NoControlsNotificationModal
            text="Waiting other players to connect ..."
            onClose={closeModal}
            isOpen={isOpen}
        >
            <div className={styles.spinner} />
        </NoControlsNotificationModal>
    );
});
