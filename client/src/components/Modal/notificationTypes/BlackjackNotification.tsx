import React from "react";
import { DisappearingNotificationModal } from "../modalTypes/DisappearingModal";
import styles from "../styles.module.css";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const BlackjackNotification = ({ isOpen, closeModal }: Props) => {
    return (
        <DisappearingNotificationModal
            onClose={closeModal}
            isOpen={isOpen}
            timer={1200}
            modalStyle="transparent"
        >
            <div className={styles.blackjackNotification}>
                Blackjack
            </div>
        </DisappearingNotificationModal>
    );
};
