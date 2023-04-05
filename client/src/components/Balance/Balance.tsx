/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { useGame } from "../../context/GameContext";
import styles from "./styles.module.css";

export const Balance = observer(() => {
    const game = useGame();
    const player = game.ui.getPlayer();
    return (
        <div className={styles.balanceContainer}>
            {/* {player && ( */}
            <div className={styles.inner}>
                <div className={styles.amount}>
                    <div className={styles.amountKey}>Balance:</div>
                    <span className={styles.amountValue}>2000$</span>
                    {/* <span>{player.balance}</span> */}
                </div>
                <div className={styles.amount}>
                    <div className={styles.amountKey}>Bet Amount:</div>
                    <span className={styles.amountValue}>20$</span>
                    {/* <span>{player.bet}</span> */}
                </div>
            </div>
            {/* )} */}
        </div>
    );
});
