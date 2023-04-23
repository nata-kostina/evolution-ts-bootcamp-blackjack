import React from "react";
import { YesNoAcknowledgement } from "../../../types/notification.types";
import { withModal, WithModalProps } from "../hoc/withModal";
import styles from "../styles.module.css";

interface YesNoNotificationProps extends WithModalProps {
    text: string;
    handleAnswer: (answer: YesNoAcknowledgement) => void;
    onClose: () => void;
}

const YesNoNotification = ({ text, handleAnswer, onClose }: YesNoNotificationProps) => {
    const handleClick = (response: YesNoAcknowledgement) => {
        handleAnswer(response);
        onClose();
    };
    return (
        <>
            <div className={styles.text}>{text}</div>
            <div className={styles.controls}>
                <button className={styles.btnAnswer} onClick={() => handleClick("yes")}>Yes</button>
                <button className={styles.btnAnswer} onClick={() => handleClick("no")}>No</button>
            </div>
        </>
    );
};

export const YesNoNotificationModal = withModal(YesNoNotification);
