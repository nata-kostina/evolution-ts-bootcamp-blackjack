import { useEffect } from "react";
import { useConnection } from "../context/ConnectionContext";
import { GameMode } from "../types/types";

export const useLaunchGame = (): void => {
    const connection = useConnection();
    const connectionID = connection.getConncetionID();
    useEffect(() => {
        if (connectionID) {
            connection.sendRequest<"startGame">({
                event: "startGame",
                payload: [{ mode: GameMode.Single, playerID: connectionID }],
            });
        }
        return () => {
            const roomID = connection.getRoomID();
            if (connectionID && roomID) {
                connection.sendRequest<"finishGame">({
                    event: "finishGame",
                    payload: [{ roomID, playerID: connectionID }],
                });
            }
        };
    }, [connection, connectionID]);
};
