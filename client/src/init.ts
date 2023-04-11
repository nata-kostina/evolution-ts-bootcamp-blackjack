import { CanvasBase } from "./canvas/CanvasBase";
import { SceneCanvasElement } from "./canvas/canvasElements/Scene.canvas.element";
import { Controller } from "./canvas/Controller";
import { serverURL } from "./constants/connection.constants";
import { Connection } from "./stores/Connection";
import { Game } from "./stores/Game";
import { UIStore } from "./stores/UIstore";
import { GameMode } from "./types/game.types";

export const init = (): { connection: Connection; game: Game; } => {
    const uiStore = new UIStore();
    const controller = new Controller(uiStore);

    const canvas = new CanvasBase();
    const matrix = canvas.getGameMatrix();
    const scene = new SceneCanvasElement(canvas, matrix, controller);

    const playerID: string | null = localStorage.getItem("player_id");

    const game = new Game(uiStore, scene);
    const connection = new Connection(serverURL, game);

    setTimeout(() => {
        connection.sendRequest<"initGame">({
            event: "initGame",
            payload: [{ playerID, mode: GameMode.Single }],
        });
    }, 5000);

    return {
        connection,
        game,
    };
};
