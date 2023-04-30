import React from "react";
import { WithModalProps, withModal } from "../hoc/withModal";
import styles from "../styles.module.css";

interface NoControlsNotificationProps extends WithModalProps {
    text: string;
    children: React.ReactNode;
}
const NoControlsNotification = ({ text, children }: NoControlsNotificationProps) => {
    return (
        <>
            <div className={styles.text}>{text}</div>
            {children}
        </>
    );
};

export const NoControlsNotificationModal = withModal(NoControlsNotification);
