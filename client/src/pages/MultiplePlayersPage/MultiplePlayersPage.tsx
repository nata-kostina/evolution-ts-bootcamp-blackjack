/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { game } from "../../store";
import { GameMode } from "../../types/types";

export const MultiplePlayersPage = observer(() => {
    const [modalIsOpen, setIsOpen] = useState(false);

    const processError = () => {
        setIsOpen(false);
        game.errorHandler.execute();
    };

    useEffect(() => {
        alert("Not implemented yet");
    }, []);

    useEffect(() => {
        if (game.isFailed) {
            setIsOpen(true);
        }
    }, [game.isFailed]);

    const handleNewGameClick = () => {
        game.startGame(GameMode.Multi);
    };
    return (
        <div />
    );
});
