/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { ReactSVG } from "react-svg";
import { observer } from "mobx-react-lite";
import styles from "./styles.module.css";
import { Action, ActionBtn } from "../../types/types";
import { useGame } from "../../context/GameContext";
import { useConnection } from "../../context/ConnectionContext";

interface Props {
    item: ActionBtn;
}

export const ActionButton = observer(({ item }: Props) => {
    const connection = useConnection();
    const game = useGame();
    const disabled = game.ui.isBtnDisabled(item.action);
    const handleClick = () => {
        const playerID = connection.getConncetionID();
        const roomID = connection.getRoomID();
        if (playerID && roomID) {
            if (item.action === Action.BET) {
                const bet = game.ui.getBet();
                if (bet) {
                    console.log("emit placeBet");
                    connection.sendRequest<"placeBet">({
                        event: "placeBet",
                        payload: [{
                            playerID,
                            bet,
                            roomID,
                        }],
                    });
                }
            } else {
                connection.sendRequest<"makeDecision">({
                    event: "makeDecision",
                    payload: [{
                        playerID,
                        action: item.action,
                        roomID,
                    }],
                });
            }
        }
    };
    return (
        <button type="button" className={styles.controlItem} onClick={handleClick} disabled={disabled}>
            <div className={styles.imgContainer}>
                <ReactSVG className={styles.imgContainerInner} src={item.svgPath} />
            </div>
            <div className={styles.textContainer}>{item.action}</div>
        </button>
    );
});
