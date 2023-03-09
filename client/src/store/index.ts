import { Connection } from "./Connection";
import { Game } from "./Game";
import { Player } from "./Player";

export const connection = new Connection();
export const game = new Game(connection);
export const player = new Player(connection);
