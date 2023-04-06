/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { ReactSVG } from "react-svg";
import { observer } from "mobx-react-lite";
import styles from "./styles.module.css";
import { BetAction, BetActionBtn } from "../../types/types";
import { useGame } from "../../context/GameContext";

interface Props {
    item: BetActionBtn;
}

export const BetActionButton = observer(({ item }: Props) => {
    const game = useGame();
    const disabled = game.ui.isBetEditBtnDisabled();
    const handleClick = () => {
        switch (item.action) {
            case BetAction.Undo:
                game.ui.undoBet();
                break;
            case BetAction.Reset:
                game.ui.clearBets();
                break;
        }
    };
    return (
        <button type="button" className={styles.betBtn} onClick={handleClick} disabled={disabled}>
            <div className={styles.imgContainer}>
                <ReactSVG className={styles.imgContainerInner} src={item.svgPath} />
            </div>
            <div className={styles.textContainer}>{`${item.action} bet`}</div>
        </button>
    );
});
