import React from "react";
import { WithModalProps, withModal } from "./hoc/withModal";

type OkCloseNotificationProps = WithModalProps;

const OkCloseNotification = ({ onClose }: OkCloseNotificationProps) => {
    return (
        <div>
            <button onClick={onClose}>Ok</button>
        </div>
    );
};

export const OkCloseNotificationModal = withModal(OkCloseNotification);
