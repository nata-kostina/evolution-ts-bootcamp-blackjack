import React from "react";
import { observer } from "mobx-react-lite";
import { DisappearingNotificationModal } from "../modalTypes/DisappearingModal";

interface Props {
    isOpen: boolean;
    closeModal: () => void;
}

export const PlaceBetNotification = observer(({ isOpen, closeModal }: Props) => {
    return (
        <DisappearingNotificationModal
            text="Place your bet please"
            onClose={closeModal}
            isOpen={isOpen}
            timer={1000}
        />
    );
});
