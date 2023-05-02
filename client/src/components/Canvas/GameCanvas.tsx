import React, { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { CanvasBase } from "../../canvas/CanvasBase";
import { SceneManager } from "../../canvas/canvasElements/SceneManager";
import { useGame } from "../../context/GameContext";
import { CanvasController } from "../../canvas/CanvasController";
import styles from "./styles.module.css";
import { AssetsLoader } from "../../canvas/utils/assetsManager";
import { useConnection } from "../../context/ConnectionContext";
import { LoaderScreen } from "../LoaderScreen/LoaderScreen";
import { GameMode } from "../../types/game.types";
import { ClientToServerEvents, RequestParameters } from "../../types/socket.types";

export const GameCanvas = observer(() => {
    const reactCanvas = useRef<HTMLCanvasElement>(null);
    const game = useGame();
    const connection = useConnection();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { current: canvas } = reactCanvas;

        if (!canvas || !game || !connection) {
            return;
        }

        const canvasBase = new CanvasBase(canvas);
        const matrix = canvasBase.getGameMatrix();

        const controller = new CanvasController(game.UI);
        controller.requestHandler = (request: RequestParameters<keyof ClientToServerEvents>) => connection.sendRequest(request);

        const sceneManager = new SceneManager(canvasBase.scene, matrix, controller);
        game.scene = sceneManager;

        const assetsManager = new AssetsLoader(canvasBase.scene);

        assetsManager.preload()
            .then(() => {
                setIsLoading(false);
                sceneManager.addContent();
                const playerID: string | null = localStorage.getItem("player_id");

                const isDebugMode = window.location.search.includes("debug=true");

                connection.sendRequest<"initGame">({
                    event: "initGame",
                    payload: [{ playerID, mode: GameMode.Single, debug: isDebugMode }],
                });
            })
            .catch((error) => console.log(error));
    }, [reactCanvas, game, connection]);
    const isGameLoading = isLoading || !connection?.isInitialized;

    return (
        <>
            {isGameLoading && <LoaderScreen />}
            <canvas ref={reactCanvas} id={styles.canvas} data-testid="canvas" />;
        </>
    );
});
