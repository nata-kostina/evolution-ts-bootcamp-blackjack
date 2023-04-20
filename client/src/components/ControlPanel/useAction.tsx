import { useConnection } from "../../context/ConnectionContext";
import { useGame } from "../../context/GameContext";
import { Connection } from "../../stores/Connection";
import { Game } from "../../stores/Game";
import { Action, BetAction } from "../../types/game.types";

export const useAction = () => {
    const connection = useConnection() as Connection;
    const game = useGame() as Game;

    const handleClick = (action: Action | BetAction) => {
        const playerID = game.playerID;
        const roomID = connection.roomID;

        if (action === Action.BET) {
            if (playerID && roomID) {
                const bet = game.UI.bet;
                if (bet) {
                    connection.sendRequest<"placeBet">({
                        event: "placeBet",
                        payload: [{
                            playerID,
                            bet,
                            roomID,
                        }],
                    });
                }
            }
        }

        if (isPlayerAction(action) && action !== Action.BET) {
            if (playerID && roomID) {
                connection.sendRequest<"makeDecision">({
                    event: "makeDecision",
                    payload: [{
                        playerID,
                        action,
                        roomID,
                    }],
                });
            }
            if (action === Action.DOUBLE && game.UI.bet) {
                game.UI.addBet({ value: game.UI.bet });
            }
            game.UI.toggleVisibleActionBtnsDisabled(true);
        }

        if (action === BetAction.Undo) {
            game.UI.undoBet();
        }

        if (action === BetAction.Reset) {
            game.UI.resetBet();
        }
    };
    return { handleClick };
};

export function isPlayerAction(
    action: Action | BetAction,
): action is Action {
    return action !== BetAction.Undo && action !== BetAction.Reset;
}
