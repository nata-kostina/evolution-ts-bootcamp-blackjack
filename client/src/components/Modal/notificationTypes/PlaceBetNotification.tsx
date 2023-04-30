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
            onClose={closeModal}
            isOpen={isOpen}
            timer={1000}
        ><p>Place your bet please</p>
        </DisappearingNotificationModal>
    );
});
