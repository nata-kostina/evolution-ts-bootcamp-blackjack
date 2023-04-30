import { PlayerID, PlayerInstance } from "../../types/game.types";

type PickPlayerInstanceFn = (payload: { playerID: PlayerID; players: Record<PlayerID, PlayerInstance>; }) => PlayerInstance;

export const pickPlayerInstance: PickPlayerInstanceFn = ({ playerID, players }): PlayerInstance => {
    const id = Object.keys(players).find((p) => p === playerID);
    if (id) {
        return players[id];
    }
    throw new Error("Failed to get current player");
};
