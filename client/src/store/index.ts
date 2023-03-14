import { Connection } from "./Connection";
import { Game } from "./Game";
import { UIStore } from "./ui/UIstore";

export const connection = new Connection();
export const uiStore = new UIStore(connection);
export const game = new Game(connection, uiStore);
