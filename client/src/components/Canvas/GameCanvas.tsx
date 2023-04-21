import React, { useEffect, useRef, useState } from "react";
import { CanvasBase } from "../../canvas/CanvasBase";
import { SceneManager } from "../../canvas/canvasElements/SceneManager";
import { useGame } from "../../context/GameContext";
import { Controller } from "../../canvas/Controller";
import styles from "./styles.module.css";
import { AssetsLoader } from "../../canvas/utils/assetsManager";
import { useConnection } from "../../context/ConnectionContext";
import { LoaderScreen } from "../LoaderScreen/LoaderScreen";
import { GameMode } from "../../types/game.types";

export const GameCanvas = () => {
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
        const controller = new Controller(game.UI);
        const sceneManager = new SceneManager(canvasBase.scene, matrix, controller);
        game.scene = sceneManager;

        const assetsManager = new AssetsLoader(canvasBase.scene);
        assetsManager.preload()
            .then(() => {
                setTimeout(() => {
                    setIsLoading(false);
                    sceneManager.addContent();
                    const playerID: string | null = localStorage.getItem("player_id");

                    connection.sendRequest<"initGame">({
                        event: "initGame",
                        payload: [{ playerID, mode: GameMode.Single }],
                    });
                }, 0);
            })
            .catch((error) => console.log(error));
    }, [reactCanvas, game, connection]);

    return (
        <>
            {(isLoading || connection?.isWaiting) && <LoaderScreen />}
            <canvas ref={reactCanvas} id={styles.canvas} />;
        </>
    );
};
