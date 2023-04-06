/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Balance } from "../Balance/Balance";
import styles from "./styles.module.css";
import { NotificationModal } from "../Modal/notification/NotificationModal";
import { actionButtons } from "../../constants/game.constants";
import { ActionButton } from "./ActionButton";
import { Action } from "../../types/types";
import BetSVG from "../../assets/img/actions/bet.svg";
import { ActionPanel } from "./ActionPanel";
import { BetControlPanel } from "../BetControlPanel/BetControlPanel";

const notificationDelay = 200;

export const ControlPanel = observer(() => {
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if (game.ui.notification.queue.length > 0) {
    //             game.ui.notification.showNotification();
    //         }
    //     }, notificationDelay);

    //     return () => clearTimeout(timer);
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [game.ui.notification.queue]);

    // const closeModal = () => {
    //     if (game.ui.notification.currentModal) {
    //         // const { variant } = game.ui.notification.currentModal.notification;
    //         // const updatedStatus = changeStatus(game.status, variant);
    //         // game.updateStatus(updatedStatus);
    //     }
    //     game.ui.notification.hideNotification();
    // };
    return (
        <>
            <div className={styles.controlPanel}>
                <div className={styles.inner}>
                    <Balance />
                    <ActionPanel actionBtns={actionButtons} type="playerAction" />
                    <BetControlPanel />
                    {/* <ActionPanel actionBtns={actionButtons} type="playerAction" /> */}
                    {/* <div className={styles.actionsPanel}>
                        <ActionButton key={Action.BET} item={{ action: Action.BET, svgPath: BetSVG }} />
                        {actionButtons.map((btn) => {
                            return <ActionButton key={btn.action} item={btn} />;
                        })}
                    </div> */}
                </div>
            </div>
            {/*
                <Balance />
                {/* <BetsForm /> */}
            {/*  <PlayerActions /> */}
            {/* <NotificationModal
                closeModal={closeModal}
                isOpen={game.ui.notification.isShown}
                modalVariant={game.ui.notification.currentModal}
            /> */}
        </>
    );
});
