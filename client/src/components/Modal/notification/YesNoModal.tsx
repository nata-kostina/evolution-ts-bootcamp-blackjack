import React from "react";
import { withModal, WithModalProps } from "./hoc/withModal";

interface YesNoNotificationProps extends WithModalProps {
    text: string;
    positiveCallback: () => void;
    negativeCallback: () => void;
    onClose: () => void;
}

export const YesNoNotification = ({ text, positiveCallback, negativeCallback, onClose }: YesNoNotificationProps) => {
    const handleYesClick = () => {
        positiveCallback();
        onClose();
    };
    const handleNoClick = () => {
        negativeCallback();
        onClose();
    };

    return (
        <div>
            <div>{text}</div>
            <button onClick={handleYesClick}>Yes</button>
            <button onClick={handleNoClick}>No</button>
        </div>
    );
};

export const YesNoNotificationModal = withModal(YesNoNotification);
