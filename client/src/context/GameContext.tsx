import React, { createContext, useContext } from "react";
import { game } from "../init";
import { Game } from "../store/Game";
import { ContextProviderProps } from "../types/types";

const GameContext = createContext<Game>(game);

export const GameProvider: React.FC<ContextProviderProps> = ({
    children,
}) => {
    return (
        <GameContext.Provider value={game}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
