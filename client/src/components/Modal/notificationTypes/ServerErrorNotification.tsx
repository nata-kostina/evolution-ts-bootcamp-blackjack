import React from "react";
import { OkCloseNotificationModal } from "../modalTypes/OkModal";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const ServerErrorNotification = ({ isOpen, closeModal }: Props) => {
    const handleOkClick = () => {
        window.location.reload();
    };
    return (
        <OkCloseNotificationModal
            text={"Ooops! Can't reach the server. Try again later"}
            onClose={closeModal}
            isOpen={isOpen}
            handleOkClick={handleOkClick}
        />
    );
};
