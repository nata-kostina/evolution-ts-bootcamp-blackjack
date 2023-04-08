import { useConnection } from "../../context/ConnectionContext";
import { useGame } from "../../context/GameContext";
import { Action } from "../../types/types";

export const useAction = () => {
    const connection = useConnection();
    const game = useGame();
    const handleClick = (action: Action) => {
        const playerID = connection.getConncetionID();
        const roomID = connection.getRoomID();
        if (playerID && roomID) {
            if (action === Action.BET) {
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
                        action,
                        roomID,
                    }],
                });
                game.ui.resetHelperTarget();
            }
        }
    };
    return { handleClick };
};
