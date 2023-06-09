import { Vector3 } from "@babylonjs/core";
import { Cell } from "../../types/canvas.types";
import { GameMatrix } from "../GameMatrix";

export const getPositionFromMatrix = (matrix: GameMatrix, cell: Cell): Vector3 => {
    const index = matrix.matrix.indexOf(cell);
    const row = Math.floor(index / matrix.colNum);
    const column = index % matrix.colNum;
    return new Vector3(
        Math.round((-matrix.matrixWidth * 0.5 + matrix.cellWidth * 0.5 + matrix.cellWidth * column) * 100) / 100,
        Math.round((matrix.matrixHeight * 0.5 - matrix.cellHeight * 0.5 - matrix.cellHeight * row) * 100) / 100,
        0,
    );
};
