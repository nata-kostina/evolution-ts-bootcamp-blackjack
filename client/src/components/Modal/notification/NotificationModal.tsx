/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { ModalKinds, ModalUnion, NotificationVariant } from "../../../types/types";
import { assertUnreachable } from "../../../utils/assertUnreachable";
import { DisappearingNotificationModal } from "./DisappearingModal";
import { OkCloseNotificationModal } from "./OkModal";
import { TakeMoneyOrStandNotification } from "./TakeMoneyOrStandNotification";
import { YesNoNotificationModal } from "./YesNoModal";

interface Props {
    modalVariant: ModalUnion | null;
    isOpen: boolean;
    closeModal: () => void;
}

export const NotificationModal = ({ isOpen, modalVariant, closeModal }: Props) => {
    if (!modalVariant) { return null; }

    switch (modalVariant.notification.variant) {
        case NotificationVariant.StandOrTakeMoney:
            return <TakeMoneyOrStandNotification isOpen={isOpen} closeModal={closeModal} />;
        default:
            return null;
    }
    // switch (modalVariant.type) {
    //     case ModalKinds.Ok:
    //         return <OkCloseNotificationModal onClose={closeModal} isOpen={isOpen} />;
    //     case ModalKinds.YesNo:
    //         const { notification, handleAnswer } = modalVariant;
    //         return (
    //             <YesNoNotificationModal
    //                 text={notification.text}
    //                 onClose={closeModal}
    //                 isOpen={isOpen}
    //                 handleAnswer={handleAnswer}
    //             />
    //         );
    //     case ModalKinds.Disappearing:
    //         const { notification: disappearingNotification, timer } = modalVariant;
    //         return (
    //             <DisappearingNotificationModal
    //                 onClose={closeModal}
    //                 isOpen={isOpen}
    //                 text={disappearingNotification.text}
    //                 timer={timer}
    //             />
    //         );
    //     default:
    //         assertUnreachable(modalVariant);
    // }
};
