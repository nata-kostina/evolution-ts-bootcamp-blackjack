import { useConnection } from "../../context/ConnectionContext";
import { useGame } from "../../context/GameContext";
import { Connection } from "../../stores/Connection";
import { Game } from "../../stores/Game";
import { Action } from "../../types/game.types";

export const useAction = () => {
    const connection = useConnection() as Connection;
    const game = useGame() as Game;
    const handleClick = (action: Action) => {
        const playerID = game.playerID;
        const roomID = connection.roomID;
        if (playerID && roomID) {
            if (action === Action.BET) {
                const bet = game.UI.bet;
                if (bet) {
                    console.log("emit placeBet: ", {
                        playerID,
                        bet,
                        roomID,
                    });
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
