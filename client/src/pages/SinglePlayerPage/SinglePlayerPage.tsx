import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import { RequireConnection } from "../../hoc/RequireConnection";
import { GameBoard } from "./GameBoard";
import { ErrorModalBase } from "../../components/Modal/ErrorModalBase";

const SinglePlayerPage = observer(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [modalIsOpen, setIsOpen] = useState(false);

    const processError = () => {
        setIsOpen(false);
        game.errorHandler.execute();
    };

    useEffect(() => {
        game.startGame();
        return () => {
            console.log("Single page unmount");
            game.finishGame();
        };
    }, []);

    useEffect(() => {
        if (game.isFailed) {
            setIsOpen(true);
        } else {
            game.setNextRequest();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.isFailed]);
    return (
        <div>
            <div>Game status: {game.status}</div>
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

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
