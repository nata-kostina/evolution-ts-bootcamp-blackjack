import { useEffect } from "react";
import { useConnection } from "../context/ConnectionContext";
import { GameMode } from "../types/types";

export const useGame = (): void => {
    const connection = useConnection();
    useEffect(() => {
        connection.sendRequest<"startGame">({
            event: "startGame",
            payload: [{ mode: GameMode.Single, playerID: connection.getConncetionID() }],
        });
        return () => {
            // connection.sendRequest();
        };
    }, []);
};
