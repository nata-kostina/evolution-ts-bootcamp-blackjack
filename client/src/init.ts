import { CanvasBase } from "./canvas/CanvasBase";
import { SceneCanvasElement } from "./canvas/canvasElements/Scene.canvas.element";
import { Controller } from "./canvas/Controller";
import { serverURL } from "./constants/connection.constants";
import { Connection } from "./stores/Connection";
import { Game } from "./stores/Game";
import { UIStore } from "./stores/UIstore";

export const { connection, game } = (
    function init(): { connection: Connection; game: Game; } {
        const uiStore = new UIStore();
        const controller = new Controller(uiStore);

        const canvas = new CanvasBase();
        const matrix = canvas.getGameMatrix();
        const scene = new SceneCanvasElement(canvas, matrix, controller);

        const newGame = new Game(canvas, uiStore, scene);
        const newConnection = new Connection(serverURL, newGame);

        return {
            connection: newConnection, game: newGame,
        };
    }());
