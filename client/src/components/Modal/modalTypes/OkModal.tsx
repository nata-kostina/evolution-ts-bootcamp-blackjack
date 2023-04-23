import React from "react";
import { WithModalProps, withModal } from "../hoc/withModal";
import styles from "../styles.module.css";

interface OkCloseNotificationProps extends WithModalProps {
    text: string;
    handleOkClick: () => void;
}
const OkCloseNotification = ({ onClose, text, handleOkClick }: OkCloseNotificationProps) => {
    const handleClick = () => {
        handleOkClick();
        onClose();
    };
    return (
        <>
            <div className={styles.text}>{text}</div>
            <button className={styles.btnAnswer} onClick={handleClick}>Ok</button>
        </>
    );
};

export const OkCloseNotificationModal = withModal(OkCloseNotification);
