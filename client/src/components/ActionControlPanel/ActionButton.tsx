/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { ReactSVG } from "react-svg";
import { observer } from "mobx-react-lite";
import { TbTriangleInvertedFilled } from "react-icons/tb";
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
    const disabled = game.ui.isPlayerActionBtnDisabled(item.action);
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
    const helperEnabled = game.ui.helperTarget === item.action;
    return (
        <button type="button" className={styles.controlItem} onClick={handleClick} disabled={disabled}>
            <div className={styles.helper} style={{ display: helperEnabled ? "block" : "none" }}>
                <svg width="50px" height="50px">
                    <defs>
                        <linearGradient
                            id={`bluegradient${item.action}`}
                            gradientUnits="userSpaceOnUse"
                            x1="50%"
                            x2="54.584%"
                            y1="29.143%"
                            y2="70.857%"
                        >
                            <stop stopColor="#7a6ded" offset="0%" />
                            <stop stopColor="#591885" offset="100%" />
                        </linearGradient>
                    </defs>
                    <TbTriangleInvertedFilled
                        color="orange"
                       // className={styles.helperIcon}
                        // style={{ color: `url(#${`bluegradient${item.action}`})` }}
                        // style={{ color: `url(#bluegradient${item.action})` }}
                        // color={`url(#bluegradient${item.action})`}
                        size={50}
                    />
                </svg>
            </div>
            <div className={styles.imgContainer}>
                <ReactSVG className={styles.imgContainerInner} src={item.svgPath} />
            </div>
            <div className={styles.textContainer}>{item.action}</div>
        </button>
    );
});
