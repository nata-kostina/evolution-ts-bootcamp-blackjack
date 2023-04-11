import React from "react";
import { BalancePanel } from "../BalancePanel/BalancePanel";
import styles from "./styles.module.css";
import { PlayerActionsPanel } from "../PlayerActionsPanel/PlayerActionsPanel";
import { BetEditPanel } from "../BetEditPanel/BetEditPanel";

export const ControlPanel = () => {
    return (
        <div className={styles.controlPanel}>
            <div className={styles.inner}>
                <BalancePanel />
                <PlayerActionsPanel />
                <BetEditPanel />
            </div>
        </div>
    );
};
