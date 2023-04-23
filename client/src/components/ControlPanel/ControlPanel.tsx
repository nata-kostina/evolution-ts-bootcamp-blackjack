import React from "react";
import { BalancePanel } from "../BalancePanel/BalancePanel";
import styles from "./styles.module.css";
import { PlayerActionsPanel } from "../PlayerActionsPanel/PlayerActionsPanel";

export const ControlPanel = () => {
    return (
        <div className={styles.controlPanel} data-testid="controlPanel">
            <div className={styles.inner}>
                <BalancePanel />
                <PlayerActionsPanel />
            </div>
        </div>
    );
};
