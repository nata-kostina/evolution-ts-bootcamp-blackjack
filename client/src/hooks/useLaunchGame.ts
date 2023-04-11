/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";
import { useConnection } from "../context/ConnectionContext";
import { Connection } from "../stores/Connection";
import { GameMode } from "../types/game.types";

export const useLaunchGame = (connectionID: string | null): void => {
    const connection = useConnection() as Connection;
    useEffect(() => {
        console.log("connectionID: ", connectionID);
        if (connectionID) {
            connection.sendRequest({
                event: "initGame",
                payload: [{ mode: GameMode.Single, playerID: connectionID }],
            });
        }
        return () => {
            // const roomID = connection.roomID;
            // if (connectionID && roomID) {
            //     connection.sendRequest<"finishGame">({
            //         event: "finishGame",
            //         payload: [{ roomID, playerID: connectionID }],
            //     });
            // }
        };
    }, [connection, connectionID]);
};
