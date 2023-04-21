import { serverURL } from "./constants/connection.constants";
import { Connection } from "./stores/Connection";
import { Game } from "./stores/Game";
import { UIStore } from "./stores/UIstore";

export const init = (): { connection: Connection; game: Game; } => {
    const uiStore = new UIStore();
    const game = new Game(uiStore);
    const connection = new Connection(serverURL, game);
    return {
        connection,
        game,
    };
};
