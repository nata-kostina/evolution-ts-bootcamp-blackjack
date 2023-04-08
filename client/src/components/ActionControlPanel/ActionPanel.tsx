import React from "react";
import { Action } from "../../types/game.types";
import { ActionButton } from "./ActionButton";
import styles from "./styles.module.css";

type ActionBtn = {
    action: Action;
    svgPath: string;
};

interface Props {
    type: string;
    actionBtns: ActionBtn[];
}

export const ActionPanel = ({ actionBtns, type }: Props) => {
    return (
        <div className={`${styles.actionsPanel} ${type}`}>
            {actionBtns.map((btn) => {
                return <ActionButton key={btn.action} item={btn} />;
            })}
        </div>
    );
};
