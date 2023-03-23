/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Navigate, Link } from "react-router-dom";
import { game } from "../../store";
import { GameMode } from "../../types/types";
import { ErrorModalBase } from "../../components/Modal/ErrorModalBase";
import { GameBoard } from "../SinglePlayerPage/GameBoard";

export const MultiplePlayersPage = observer(() => {
    const [modalIsOpen, setIsOpen] = useState(false);

    const processError = () => {
        setIsOpen(false);
        game.errorHandler.execute();
    };

    useEffect(() => {
        console.log("Multi page mount", game.status);
        game.startGame(GameMode.Multi);
        return () => {
            console.log("Multi page unmount");
            // game.finishGame();
        };
    }, []);

    useEffect(() => {
        if (game.isFailed) {
            setIsOpen(true);
        }
    }, [game.isFailed]);
    // if (game.status === "new-game") {
    //     redirect("/");
    // }
    const handleNewGameClick = () => {
        game.startGame(GameMode.Multi);
    };
    return (
        <div>
            <button onClick={handleNewGameClick}>New game</button>
            <div>Game status: {game.status}</div>
            {/* {game.status === "new-game" && <Navigate to="/" />} */}
            {!game.isFailed ? <GameBoard /> : "Loading..."}
            {game.error && (
                <ErrorModalBase
                    type={game.error}
                    modalIsOpen={modalIsOpen}
                    closeModal={processError}
                />
            )}
        </div>
    );
});
