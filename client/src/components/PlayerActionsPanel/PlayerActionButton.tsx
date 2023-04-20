import React from "react";

import { ReactSVG } from "react-svg";
import { observer } from "mobx-react-lite";
import styles from "./styles.module.css";
import { useGame } from "../../context/GameContext";
import { useAction } from "../ControlPanel/useAction";
import { ActionBtn } from "../../types/ui.types";
import { Game } from "../../stores/Game";

interface Props {
    item: ActionBtn;
}

export const PlayerActionButton = observer(({ item }: Props) => {
    const { handleClick } = useAction();
    const game = useGame() as Game;
    const btnState = game.UI.getPlayerActionBtnstate(item.action);
    return (
        <>{btnState.isVisible && (
            <button
                type="button"
                className={styles.controlItem}
                onClick={() => handleClick(item.action)}
                disabled={btnState.isDisabled}
            >
                <div className={styles.imgContainer}>
                    <ReactSVG className={styles.imgContainerInner} src={item.svgPath} />
                </div>
                <div className={styles.textContainer}>{item.action}</div>
            </button>
        )}
        </>
    );
});
