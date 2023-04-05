/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { ReactSVG } from "react-svg";
import styles from "./styles.module.css";
import { ActionBtn } from "../../types/types";
import { useGame } from "../../context/GameContext";
import { useConnection } from "../../context/ConnectionContext";

interface Props {
    item: ActionBtn;
}

export const ActionButton = ({ item }: Props) => {
    const connection = useConnection();
    const handleClick = () => {
        const playerID = connection.getConncetionID();
        const roomID = connection.getRoomID();
        if (playerID && roomID) {
            connection.sendRequest<"makeDecision">({
                event: "makeDecision",
                payload: [{
                    playerID,
                    action: item.action,
                    roomID,
                }],
            });
        }
    };
    return (
        <button type="button" className={styles.controlItem} onClick={handleClick}>
            <div className={styles.imgContainer}>
                <ReactSVG className={styles.imgContainerInner} src={item.svgPath} />
            </div>
            <div className={styles.textContainer}>{item.action}</div>
        </button>
    );
};
