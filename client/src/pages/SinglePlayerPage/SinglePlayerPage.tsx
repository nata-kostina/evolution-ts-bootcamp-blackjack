/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import { RequireConnection } from "../../hoc/RequireConnection";
import { GameBoard } from "./GameBoard";
import { ErrorModalBase } from "../../components/Modal/ErrorModalBase";
import { GameMode } from "../../types/types";

const SinglePlayerPage = observer(() => {
    const [modalIsOpen, setIsOpen] = useState(false);

    const processError = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        game.startGame(GameMode.Single);
        return () => {
            game.finishGame();
        };
    }, []);

    useEffect(() => {
        if (game.isFailed) {
            setIsOpen(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.isFailed]);
    return (
        <div>
            <div>Game status: {game.status}</div>
            {game.isReady && <GameBoard />}
            {game.isLoading && "Loading..."}
            {game.isFailed && (
                <ErrorModalBase
                    modalIsOpen={modalIsOpen}
                    closeModal={processError}
                />
            )}
        </div>
    );
});

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
