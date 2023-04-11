import React, { createContext, ReactNode, useContext } from "react";
import { Game } from "../stores/Game";

interface GameContextProviderProps {
    children: ReactNode;
    game: Game;
}

const GameContext = createContext<Game | null>(null);

export const GameProvider: React.FC<GameContextProviderProps> = ({
    children,
    game,
}) => {
    return (
        <GameContext.Provider value={game}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
