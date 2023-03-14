/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { ModalKinds, ModalUnion } from "../../../types/types";
import { assertUnreachable } from "../../../utils/assertUnreachable";
import { DisappearingNotificationModal } from "./DisappearingModal";
import { OkCloseNotificationModal } from "./OkModal";
import { YesNoNotificationModal } from "./YesNoModal";

interface Props {
    modalVariant: ModalUnion | null;
    isOpen: boolean;
    closeModal: () => void;
}

export const NotificationModal = ({ isOpen, modalVariant, closeModal }: Props) => {
    if (!modalVariant) { return null; }
    switch (modalVariant.type) {
        case ModalKinds.Ok:
            return <OkCloseNotificationModal onClose={closeModal} isOpen={isOpen} />;
        case ModalKinds.YesNo:
            const { negativeCallback, positiveCallback, text: yesNoText } = modalVariant;
            return (
                <YesNoNotificationModal
                    text={yesNoText}
                    onClose={closeModal}
                    isOpen={isOpen}
                    negativeCallback={negativeCallback}
                    positiveCallback={positiveCallback}
                />
            );
        case ModalKinds.Disappearing:
            const { text, timer } = modalVariant;
            return (
                <DisappearingNotificationModal
                    onClose={closeModal}
                    isOpen={isOpen}
                    text={text}
                    timer={timer}
                />
            );
        default:
            assertUnreachable(modalVariant);
    }
};
