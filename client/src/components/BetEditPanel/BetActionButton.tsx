/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { ReactSVG } from "react-svg";
import { observer } from "mobx-react-lite";
import styles from "./styles.module.css";
import { useGame } from "../../context/GameContext";
import { BetActionBtn } from "../../types/ui.types";
import { BetAction } from "../../types/game.types";
import { Game } from "../../stores/Game";

interface Props {
    item: BetActionBtn;
}

export const BetActionButton = observer(({ item }: Props) => {
    const game = useGame() as Game;
    const disabled = game.UI.isBetEditBtnDisabled();
    const handleClick = () => {
        switch (item.action) {
            case BetAction.Undo:
                game.UI.undoBet();
                break;
            case BetAction.Reset:
                game.UI.resetBet();
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
