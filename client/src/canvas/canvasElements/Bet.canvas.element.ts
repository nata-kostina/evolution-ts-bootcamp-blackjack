import { Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { SceneMatrix, matrixSize, matrixWidth, matrixHeight, cellSize } from "../GameMatrix";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class BetCanvasElement {
    private position: Vector3;
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase) {
        this.base = base;
        const index = SceneMatrix.indexOf("bet");

        const row = Math.floor(index / matrixSize);
        const column = index % matrixSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellSize * 0.5 + cellSize * column,
            matrixHeight * 0.5 - cellSize * 0.5 - cellSize * row,
            0,
        );
    }
}
