import React from "react";
import { PlayerActionButton } from "./PlayerActionButton";
import { actionButtons } from "../../constants/ui.constants";
import styles from "./styles.module.css";
import { useConnection } from "../../context/ConnectionContext";
import { useGame } from "../../context/GameContext";
import { GameMode } from "../../types/game.types";

export const PlayerActionsPanel = () => {
    const game = useGame();
    const connection = useConnection();
    return (
        <div className={`${styles.actionsPanel}`} data-testid="actionsPanel">
            <div className={styles.inner}>
                {actionButtons.map((btn) => {
                    return <PlayerActionButton key={btn.action} item={btn} />;
                })}
            </div>
            <button onClick={() => {
                connection?.sendRequest<"initGame">({
                    event: "initGame",
                    payload: [{ playerID: game?.playerID, mode: GameMode.Multi }],
                });
            }
            }
            >Multi Player
            </button>
        </div>
    );
};
