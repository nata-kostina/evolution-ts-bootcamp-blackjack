/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanvasBase } from "./canvas/CanvasBase";
import { SceneCanvasElement } from "./canvas/canvasElements/Scene.canvas.element";
import { serverURL } from "./constants/connection.constants";
import { Connection } from "./store/Connection";
import { Game } from "./store/Game";
import { UIStore } from "./store/ui/UIstore";

export const { connection, game } = (
    function init(): { connection: Connection; game: Game; } {
        // const canvas = new CanvasBase();
        // const scene = new SceneCanvasElement(canvas);
        const ui = new UIStore();
        const game = new Game(null, ui, null);
        const connection = new Connection(serverURL, game);
        return {
            connection, game,
        };
    }());
