/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { useConnection } from "../context/ConnectionContext";
import { GameMode } from "../types/game.types";

export const useLaunchGame = (connectionID: string | null): void => {
    const connection = useConnection();
    useEffect(() => {
        console.log("connectionID: ", connectionID);
        if (connectionID) {
            connection.sendRequest<"startGame">({
                event: "startGame",
                payload: [{ mode: GameMode.Single, playerID: connectionID }],
            });
        }
        return () => {
            const roomID = connection.roomID;
            if (connectionID && roomID) {
                connection.sendRequest<"finishGame">({
                    event: "finishGame",
                    payload: [{ roomID, playerID: connectionID }],
                });
            }
        };
    }, [connection, connectionID]);
};
