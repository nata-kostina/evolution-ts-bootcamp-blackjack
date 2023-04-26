import React, { useEffect } from "react";
import { WithModalProps, withModal } from "../hoc/withModal";

interface DisappearingNotificationProps extends WithModalProps {
    timer?: number;
    children?: JSX.Element;
}

const DisappearingNotification = ({ onClose, timer = 1000, children }: DisappearingNotificationProps) => {
    useEffect(() => {
        const timerID = setTimeout(() => onClose(), timer);
        return () => {
            clearTimeout(timerID);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <div>
            {children}
        </div>
    );
};

export const DisappearingNotificationModal = withModal(DisappearingNotification);
