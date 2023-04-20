/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    Vector3,
    Scene,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { chipRadius } from "../../constants/canvas.constants";
import { GameMatrix } from "../GameMatrix";
import { chipSet } from "../../constants/game.constants";
import { ChipCanvasElement } from "./Chip.canvas.element";
import { Controller } from "../Controller";
import { CanvasElement, MatrixProps } from "../../types/canvas.types";

export class ChipSetCanvasElement implements CanvasElement {
    private chipSet: Array<ChipCanvasElement> = [];
    private _position: Vector3;
    private readonly scene: Scene;
    private readonly num = 0;
    private readonly controller: Controller;

    public constructor(scene: Scene, matrix: GameMatrix, controller: Controller) {
        this.controller = controller;
        this.scene = scene;
        const mtx = matrix.getMatrix();
        const mtxSize = matrix.getMatrixSize();
        const cellWidth = matrix.getCellWidth();
        const cellHeight = matrix.getCellHeight();
        const matrixWidth = matrix.getMatrixWidth();
        const matrixHeight = matrix.getMatrixHeight();
        const index = mtx.indexOf("chips");

        const row = Math.floor(index / mtxSize);
        const column = index % mtxSize;
        this._position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );
        this.addContent();
    }

    public get position(): Vector3 {
        return this._position;
    }

    public update({ height, width, cellWidth, cellHeight, map, size }: MatrixProps): void {
        // const index = map.indexOf("chips");
        // const row = Math.floor(index / size);
        // const column = index % size;
        // this.position = new Vector3(
        //     -width * 0.5 + cellWidth * 0.5 + cellWidth * column,
        //     height * 0.5 - cellHeight * 0.5 - cellHeight * row,
        //     0,
        // );
        // this.chipSet.forEach((chip, idx) => {
        //     const x = this.position.x + idx * chipRadius * 1.5;
        //     chip.update(new Vector3(
        //         x,
        //         this.position.y,
        //         0,
        //     ));
        // });
    }

    public addContent(): void {
        for (let j = 0; j < chipSet.length; j++) {
            const x = this._position.x;
            const y = this._position.y - j * chipRadius * 2 * 1.1;
            const z = this._position.z;
            const chip = new ChipCanvasElement(this.scene, new Vector3(x, y, z), chipSet[j], this.controller);
            this.chipSet.push(chip);
        }
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.forEach((chip) => chip.toggleChipAction(register));
    }
}
