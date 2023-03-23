/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-cycle */
import { Connection } from "./Connection";
import { Game } from "./Game";

export const connection = new Connection();
export const game = new Game();
// export const game.ui = new game.ui();
