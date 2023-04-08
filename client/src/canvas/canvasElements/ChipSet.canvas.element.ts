/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    Vector3,
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
    private position: Vector3;
    private readonly base: CanvasBase;
    private readonly num = 0;
    private readonly controller: Controller;

    public constructor(base: CanvasBase, matrix: GameMatrix, controller: Controller) {
        console.log("CHIPSET CONSTRUCTOR");
        this.controller = controller;
        this.base = base;
        const mtx = matrix.getMatrix();
        const mtxSize = matrix.getMatrixSize();
        const cellWidth = matrix.getCellWidth();
        const cellHeight = matrix.getCellHeight();
        const matrixWidth = matrix.getMatrixWidth();
        const matrixHeight = matrix.getMatrixHeight();
        // console.log({ mtxSize, cellWidth, cellHeight, matrixWidth, matrixHeight });
        const index = mtx.indexOf("chips");

        const row = Math.floor(index / mtxSize);
        const column = index % mtxSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );
        this.addContent();
    }

    public update({ height, width, cellWidth, cellHeight, map, size }: MatrixProps): void {
        const index = map.indexOf("chips");
        const row = Math.floor(index / size);
        const column = index % size;
        this.position = new Vector3(
            -width * 0.5 + cellWidth * 0.5 + cellWidth * column,
            height * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );
        this.chipSet.forEach((chip, idx) => {
            const x = this.position.x + idx * chipRadius * 1.5;
            chip.update(new Vector3(
                x,
                this.position.y,
                0,
            ));
        });
    }

    public addContent(): void {
        console.log("CHIPSET addcontent");
        for (let j = 0; j < chipSet.length; j++) {
            const x = this.position.x + j * chipRadius * 1.4;

            const y = this.position.y - 0.09 * Math.sqrt(j * 1.5);
            // const y = this.position.y - j * 0.4 * ((0.5) / (x + 2));
            // console.log(`Single Chip Position: X: ${x}, Y: ${y}`);
            const chip = new ChipCanvasElement(this.base, new Vector3(
                x,
                y,
                0,
            ), chipSet[j], this.controller);
            this.chipSet.push(chip);
        }
    }

    public toggleChipAction(register: boolean): void {
        console.log("CHIPSET toggleChipAction: ", register);
        this.chipSet.forEach((chip) => chip.toggleChipAction(register));
    }
}
