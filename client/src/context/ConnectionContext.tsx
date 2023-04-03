import React, { createContext, useContext } from "react";
import { Connection } from "../store/Connection";
import { serverURL } from "../constants/api.constants";
import { Game } from "../store/Game";
import { CanvasBase } from "../canvas/CanvasBase";
import { SceneCanvasElement } from "../canvas/canvasElements/Scene.canvas.element";
import { UIStore } from "../store/ui/UIstore";

const canvas = new CanvasBase();
const scene = new SceneCanvasElement(canvas);
const ui = new UIStore();
const game = new Game(canvas, ui, scene);
const connection = new Connection(serverURL, game);

const ConnectionContext = createContext<Connection>(connection);

interface ConnectionProviderProps {
    children: React.ReactNode;
}

export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
    children,
}) => {
    return (
        <ConnectionContext.Provider value={connection}>
            {children}
        </ConnectionContext.Provider>
    );
};

export const useConnection = () => useContext(ConnectionContext);
