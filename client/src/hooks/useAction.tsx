import { useConnection } from "../context/ConnectionContext";
import { useGame } from "../context/GameContext";
import { Action, BetAction } from "../types/game.types";
import { ActionBtn } from "../types/ui.types";

export const useAction = () => {
    const connection = useConnection();
    const game = useGame();

    const handleClick = (actionBtn: ActionBtn) => {
        const playerID = game?.playerID;
        const roomID = connection?.roomID;

        if (isPlayerAction(actionBtn, actionBtn.action)) {
            if (playerID && roomID) {
                if (actionBtn.action === Action.Bet) {
                    const bet = game.UI.bet;
                    game?.UI.toggleVisibleActionBtnsDisabled(true);
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
                } else {
                    connection.sendRequest<"makeDecision">({
                        event: "makeDecision",
                        payload: [{
                            playerID,
                            action: actionBtn.action,
                            roomID,
                        }],
                    });
                }
            }
            if (actionBtn.action === Action.Double && game?.UI.bet) {
                game?.UI.addBet(game?.UI.bet);
            }
            game?.UI.toggleVisibleActionBtnsDisabled(true);
        } else {
            if (actionBtn.action === BetAction.Undo) {
                game?.UI.undoBet();
            }

            if (actionBtn.action === BetAction.Reset) {
                game?.UI.resetBet();
            }

            if (actionBtn.action === BetAction.Rebet) {
                game?.UI.rebet();
            }
            if (actionBtn.action === BetAction.AllIn) {
                game?.UI.allIn();
            }
        }
    };
    return { handleClick };
};

export function isPlayerAction(
    btn: ActionBtn,
    action: Action | BetAction,
): action is Action {
    return btn.type === "playerAction";
}
