import { Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class BetCanvasElement {
    private position: Vector3;
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase) {
        this.base = base;
        this.position = new Vector3(0, 0, 0);

        // const index = SceneMatrix.indexOf("bet");

        // const row = Math.floor(index / matrixSize);
        // const column = index % matrixSize;
        // this.position = new Vector3(
        //     -matrixWidth * 0.5 + cellSize * 0.5 + cellSize * column,
        //     matrixHeight * 0.5 - cellSize * 0.5 - cellSize * row,
        //     0,
        // );
    }
}
