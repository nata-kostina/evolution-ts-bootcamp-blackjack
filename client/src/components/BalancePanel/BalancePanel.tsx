/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import { useGame } from "../../context/GameContext";
import styles from "./styles.module.css";
import { Game } from "../../stores/Game";

export const BalancePanel = observer(() => {
    const game = useGame() as Game;
    const player = game.UI.player;
    return (
        <div className={styles.balanceContainer}>
            {player && (
                <div className={styles.inner}>
                    <div className={styles.amount}>
                        <div className={styles.amountKey}>Balance:</div>
                        <span className={styles.amountValue}>{player.balance}$</span>
                    </div>
                    <div className={styles.amount}>
                        <div className={styles.amountKey}>Bet Amount:</div>
                        <span className={styles.amountValue}>{player.bet}$</span>
                    </div>
                    <div className={styles.amount}>
                        <div className={styles.amountKey}>Insurance:</div>
                        <span className={styles.amountValue}>{player.insurance}$</span>
                    </div>
                </div>
            )}
        </div>
    );
});
