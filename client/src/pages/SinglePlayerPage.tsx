import React from "react";
import { observer } from "mobx-react-lite";
import { GameCanvas } from "../components/Canvas/GameCanvas";
import { ControlPanel } from "../components/ControlPanel/ControlPanel";
import { NotificationModal } from "../components/Modal/NotificationModal";
import { useModal } from "../hooks/useModal";

export const SinglePlayerPage = observer(() => {
    const { isOpen, closeModal, notification } = useModal();
    return (
        <>
            <GameCanvas />
            <ControlPanel />
            <NotificationModal
                closeModal={closeModal}
                isOpen={isOpen}
                notification={notification}
            />
        </>
    );
});

// export const SinglePlayerPageWithConnectionRequired =
//   RequireConnection(SinglePlayerPage);
