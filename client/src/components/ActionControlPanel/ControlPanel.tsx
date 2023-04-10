/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { Balance } from "../Balance/Balance";
import styles from "./styles.module.css";
import { ActionPanel } from "./ActionPanel";
import { BetControlPanel } from "../BetControlPanel/BetControlPanel";
import { actionButtons } from "../../constants/ui.constants";

export const ControlPanel = observer(() => {
    return (
        <div className={styles.controlPanel}>
            <div className={styles.inner}>
                <Balance />
                <ActionPanel actionBtns={actionButtons} type="playerAction" />
                <BetControlPanel />
            </div>
        </div>
    );
});
