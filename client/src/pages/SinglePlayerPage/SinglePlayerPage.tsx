/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { RequireConnection } from "../../hoc/RequireConnection";
import { useLaunchGame } from "../../store/useLaunchGame";
import { ControlPanel } from "../../components/ActionControlPanel/ControlPanel";
import { NotificationModal } from "../../components/Modal/notification/NotificationModal";
import { useGame } from "../../context/GameContext";
import { useConnection } from "../../context/ConnectionContext";
import { ModalKinds, NotificationVariant } from "../../types/types";
import { useNotification } from "../../hooks/useNotification";

const SinglePlayerPage = observer(() => {
    const connection = useConnection();
    const connectionID = connection.getConncetionID();
    useLaunchGame(connectionID);
    const { isOpen, closeModal, modalVariant } = useNotification();
    return (
        <>
            <ControlPanel />
            <NotificationModal
                closeModal={closeModal}
                isOpen={isOpen}
                modalVariant={modalVariant}
            />
        </>
    );
});

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
