import React from "react";
import { WithModalProps, withModal } from "../hoc/withModal";

interface OkCloseNotificationProps extends WithModalProps {
    text: string;
}
const OkCloseNotification = ({ onClose, text }: OkCloseNotificationProps) => {
    return (
        <div>
            <div>{text}</div>
            <button onClick={onClose}>Ok</button>
        </div>
    );
};

export const OkCloseNotificationModal = withModal(OkCloseNotification);
