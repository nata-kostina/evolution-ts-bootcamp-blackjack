import { serverURL } from "./constants/connection.constants";
import { Connection } from "./stores/connection.store";
import { Game } from "./stores/game.store";
import { UIStore } from "./stores/UI.store";

export const init = (): { connection: Connection; game: Game; } => {
    const uiStore = new UIStore();
    const game = new Game(uiStore);
    const connection = new Connection(serverURL, game);
    return { connection, game };
};
