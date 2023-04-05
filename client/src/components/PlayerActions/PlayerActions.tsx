/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { observer } from "mobx-react-lite";
import * as styles from "./styles.scss";
import { Action, GameMode } from "../../types/types";

export const PlayerActions = observer(() => {
    // const handleBetClick = () => {
    //     if (game.ui.betHandler && game.ui.player && game.ui.player.bet > 0) {
    //         game.ui.betHandler(game.ui.player.bet);
    //     }
    // };
    // const handleDecision = (decision: Decision) => {
    //     if (game.ui.decisionHandler) {
    //         game.ui.decisionHandler(decision);
    //     }
    // };
    // const handleNewBetClick = () => {
    //     game.ui.toggleNewBetDisabled(true);
    //     game.startGame(GameMode.Single);
    // };
    return (
        <ul className={styles.panel}>
            {/* <li className="action_item" />
            <li className="action_item">
                <button
                    type="button"
                    onClick={handleBetClick}
                    disabled={game.ui.placeBetBtnDisabled}
                >Emit Bet Place
                </button>
                <button
                    type="button"
                    onClick={handleNewBetClick}
                    disabled={game.ui.newBetDisabled}
                >New Bet
                </button>
            </li>
            <li className="action_item">
                <button
                    type="button"
                    disabled={game.ui.actionBtns.hit}
                    onClick={() => handleDecision("hit")}
                >HIT
                </button>
                <button
                    type="button"
                    disabled={game.ui.actionBtns.stand}
                    onClick={() => handleDecision("stand")}
                >STAND
                </button>
                <button
                    type="button"
                    disabled={game.ui.actionBtns.double}
                    onClick={() => handleDecision("double")}
                >DOUBLE
                </button>
                <button
                    type="button"
                    disabled={game.ui.actionBtns.surender}
                    onClick={() => handleDecision("surender")}
                >SURENDER
                </button>
            </li> */}
        </ul>
    );
});
