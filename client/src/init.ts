import { CanvasBase } from "./canvas/CanvasBase";
import { SceneCanvasElement } from "./canvas/canvasElements/Scene.canvas.element";
import { Controller } from "./canvas/Controller";
import { serverURL } from "./constants/connection.constants";
import { Connection } from "./store/Connection";
import { Game } from "./store/Game";
import { UIStore } from "./store/ui/UIstore";

export const { connection, game } = (
    function init(): { connection: Connection; game: Game; } {
        const uiStore = new UIStore();
        const controller = new Controller(uiStore);

        const canvas = new CanvasBase();
        const matrix = canvas.getGameMatrix();
        const scene = new SceneCanvasElement(canvas, matrix, controller);

        const game = new Game(canvas, uiStore, scene);
        const connection = new Connection(serverURL, game);

        return {
            connection, game,
        };
    }());
