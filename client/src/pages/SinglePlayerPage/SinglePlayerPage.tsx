import React from "react";
import { observer } from "mobx-react-lite";
import { RequireConnection } from "../../hoc/RequireConnection";
import { useLaunchGame } from "../../hooks/useLaunchGame";
import { ControlPanel } from "../../components/ActionControlPanel/ControlPanel";
import { useConnection } from "../../context/ConnectionContext";
import { useModal } from "../../hooks/useModal";
import { NotificationModal } from "../../components/Modal/NotificationModal";

const SinglePlayerPage = observer(() => {
    const connection = useConnection();
    const connectionID = connection.conncetionID;
    useLaunchGame(connectionID);
    const { isOpen, closeModal, notification } = useModal();
    return (
        <>
            <ControlPanel />
            <NotificationModal
                closeModal={closeModal}
                isOpen={isOpen}
                notification={notification}
            />
        </>
    );
});

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
