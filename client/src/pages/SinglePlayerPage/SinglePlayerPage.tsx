/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import { RequireConnection } from "../../hoc/RequireConnection";
import { GameBoard } from "./GameBoard";
import { ErrorModalBase } from "../../components/Modal/ErrorModalBase";
import { GameMode } from "../../types/types";
import { GameCanvas } from "../../canvas/GameCanvas";
import { SceneCanvasElement } from "../../canvas/canvasElements/Scene.canvas.element";
import { CardCanvasElement } from "../../canvas/canvasElements/Card.canvas.element";
import { CanvasBase } from "../../canvas/CanvasBase";
import { ControlPanel } from "../../components/ControlPanel/ControlPanel";

const SinglePlayerPage = observer(() => {
    // const [modalIsOpen, setIsOpen] = useState(false);

    // const processError = () => {
    //     setIsOpen(false);
    // };

    useEffect(() => {
        game.startGame(GameMode.Single);
        return () => {
            console.log("Unmount SinglePlayerPage");
            game.finishGame();
        };
    }, []);

    // useEffect(() => {
    //     if (game.isFailed) {
    //         setIsOpen(true);
    //     }
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [game.isFailed]);
    console.log("Mount SinglePlayerPage");
    return (
        <>
            <ControlPanel />
            {/* <div>Game status: {game.status}</div> */}
            {/* {game.isReady && <GameCanvas />} */}
            {/* {game.isLoading && "Loading..."}
            {game.isFailed && (
                <ErrorModalBase
                    modalIsOpen={modalIsOpen}
                    closeModal={processError}
                />
            )} */}
        </>
    );
});

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
