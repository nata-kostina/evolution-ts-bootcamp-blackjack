import React from "react";
import { YesNoAcknowledgement } from "../../../types/types";
import { withModal, WithModalProps } from "./hoc/withModal";

interface YesNoNotificationProps extends WithModalProps {
    text: string;
    handleAnswer: (answer: YesNoAcknowledgement) => void;
    onClose: () => void;
}

export const YesNoNotification = ({ text, handleAnswer, onClose }: YesNoNotificationProps) => {
    const handleYesClick = () => {
        handleAnswer("yes");
        onClose();
    };
    const handleNoClick = () => {
        handleAnswer("no");
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
