import React from "react";

import { ReactSVG } from "react-svg";
import { observer } from "mobx-react-lite";
import styles from "./styles.module.css";
import { useGame } from "../../context/GameContext";
import { useAction } from "../../hooks/useAction";
import { ActionBtn } from "../../types/ui.types";

interface Props {
    item: ActionBtn;
}

export const PlayerActionButton = observer(({ item }: Props) => {
    const { handleClick } = useAction();
    const game = useGame();
    const btnState = game?.UI.getPlayerActionBtnState(item.action);

    return (
        <>{btnState?.isVisible && (
            <button
                type="button"
                className={styles.controlItem}
                onClick={() => handleClick(item)}
                disabled={btnState.isDisabled}
            >
                <div className={styles.imgContainer} data-testid="actionIcon">
                    <ReactSVG className={styles.imgContainerInner} src={item.svgPath} />
                </div>
                <div className={styles.textContainer}>{item.text}</div>
            </button>
        )}
        </>
    );
});
