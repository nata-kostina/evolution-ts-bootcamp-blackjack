import { useConnection } from "../../context/ConnectionContext";
import { useGame } from "../../context/GameContext";
import { Action } from "../../types/game.types";

export const useAction = () => {
    const connection = useConnection();
    const game = useGame();
    const handleClick = (action: Action) => {
        const playerID = connection.conncetionID;
        const roomID = connection.roomID;
        if (playerID && roomID) {
            if (action === Action.BET) {
                const bet = game.UI.bet;
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
                game.UI.resetHelperTarget();
            }
        }
    };
    return { handleClick };
};
