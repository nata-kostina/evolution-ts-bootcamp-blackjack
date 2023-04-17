import React from "react";
import { observer } from "mobx-react-lite";
import { RequireConnection } from "../../hoc/RequireConnection";
import { ControlPanel } from "../../components/ControlPanel/ControlPanel";
import { useModal } from "../../hooks/useModal";
import { NotificationModal } from "../../components/Modal/NotificationModal";

const SinglePlayerPage = observer(() => {
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
