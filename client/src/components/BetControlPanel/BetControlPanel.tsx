import React from "react";
import { betActionBtns } from "../../constants/ui.constants";
import { BetActionButton } from "./BetActionButton";
import styles from "./styles.module.css";

export const BetControlPanel = () => {
    return (
        <div className={styles.betControlPanel}>
            {betActionBtns.map((btn) => {
                return <BetActionButton key={btn.action} item={btn} />;
            })}
        </div>
    );
};
