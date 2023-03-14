import React from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import "./styles.css";

export const PlayerActions = observer(() => {
    const handleBetClick = () => {
        game.placeBet();
    };
    return (
        <ul className="player-actions">
            <li className="action_item" />
            <li className="action_item">
                <button
                    type="button"
                    onClick={handleBetClick}
                    disabled={!game.isPlaceBetAvailable}
                >Emit Bet Place
                </button>
            </li>
            <li className="action_item">
                <button
                    type="button"
                    disabled={!game.isDecisionEnabled}
                >HIT
                </button>
                <button
                    type="button"
                    disabled={!game.isDecisionEnabled}
                >STAND
                </button>
            </li>
        </ul>
    );
});
