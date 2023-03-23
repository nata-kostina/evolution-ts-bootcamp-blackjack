import React from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import "./styles.css";
import { Decision } from "../../types/types";

export const PlayerActions = observer(() => {
    const handleBetClick = () => {
        game.placeBet();
    };
    const handleDecision = (decision: Decision) => {
        if (game.ui.decisionHandler) {
            game.ui.decisionHandler(decision);
        }
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
                    onClick={() => handleDecision(Decision.HIT)}
                >HIT
                </button>
                <button
                    type="button"
                    disabled={!game.isDecisionEnabled}
                    onClick={() => handleDecision(Decision.STAND)}
                >STAND
                </button>
                <button
                    type="button"
                    disabled={!game.isDecisionEnabled}
                    onClick={() => handleDecision(Decision.Double)}
                >DOUBLE
                </button>
                <button
                    type="button"
                    disabled={!game.isDecisionEnabled}
                    onClick={() => handleDecision(Decision.Surender)}
                >SURENDER
                </button>
            </li>
        </ul>
    );
});
