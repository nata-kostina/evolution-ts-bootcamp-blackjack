import React, { useEffect } from "react";
import { WithModalProps, withModal } from "./hoc/withModal";

interface DisappearingNotificationProps extends WithModalProps {
    text: string;
    timer?: number;
}

const DisappearingNotification = ({ onClose, text, timer = 1000 }: DisappearingNotificationProps) => {
    useEffect(() => {
        const timerID = setTimeout(() => onClose(), timer);
        return () => {
            clearTimeout(timerID);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div>
            <div>{text}</div>
        </div>
    );
};

export const DisappearingNotificationModal = withModal(DisappearingNotification);
