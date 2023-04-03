export type Cell = "0" | "chips" | "player-seat" | "dealer-seat" | "dealer-points" | "player-points" | "bet";

export const SceneMatrix: Cell[] = [
    "0", "0", "0", "dealer-points", "0", "0", "0",
    "chips", "0", "0", "dealer-seat", "0", "0", "0",
    "0", "0", "0", "0", "0", "0", "0",
    "0", "0", "player-points", "player-seat", "0", "0", "0",
    "0", "0", "0", "bet", "0", "0", "0",
    "0", "0", "0", "0", "0", "0", "0",
    "0", "0", "0", "0", "0", "0", "0",
    "0", "0", "0", "0", "0", "0", "0",
    "0", "0", "0", "0", "0", "0", "0",

];
export const matrixSize = 7;
export const matrixWidth = 3.5;
export const matrixHeight = 2.5;
export const cellSize = matrixWidth / matrixSize;
