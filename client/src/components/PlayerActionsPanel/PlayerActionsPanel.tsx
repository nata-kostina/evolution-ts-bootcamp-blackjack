import React from "react";
import { PlayerActionButton } from "./PlayerActionButton";
import { actionButtons } from "../../constants/ui.constants";
import styles from "./styles.module.css";

export const PlayerActionsPanel = () => {
    return (
        <div className={`${styles.actionsPanel}`}>
            <div className={styles.inner}>
                {actionButtons.map((btn) => {
                    return <PlayerActionButton key={btn.action} item={btn} />;
                })}
            </div>
        </div>
    );
};
