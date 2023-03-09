import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import { RequireConnection } from "../../hoc/RequireConnection";
import { GameBoard } from "./GameBoard";
import { ModalWindow } from "../../components/Modal/ModalWindow";

const SinglePlayerPage = observer(() => {
    const [modalIsOpen, setIsOpen] = useState(false);

    function afterOpenModal() {
        console.log("afterOpenModal");
    }

    function closeModal() {
        setIsOpen(false);
        game.errorHandler.execute();
    }

    useEffect(() => {
        game.startGame();
        // player.initPlayer();
        return () => {
            console.log("Single page unmount");
            game.resetGame();
            setIsOpen(false);
        };
    }, []);

    useEffect(() => {
        if (game.status === "error") {
            setIsOpen(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game.status]);

    return (
        <div>
            <div>Game status: {game.status}</div>
            {game.status === "started" ? <GameBoard /> : "Loading..."}
            <ModalWindow
                type="gameError"
                modalIsOpen={modalIsOpen}
                afterOpenModal={afterOpenModal}
                closeModal={closeModal}
            />
        </div>
    );
});

export const SinglePlayerPageWithConnectionRequired =
  RequireConnection(SinglePlayerPage);
