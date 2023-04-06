/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanvasElement, Cell } from "../types/types";

const SceneMatrix: Cell[] = [
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
const matrixSize = 7;
const matrixWidth = 3.5;
const matrixHeight = 2.5;
const cellSize = matrixWidth / matrixSize;

export class GameMatrix {
    private width: number;
    private height: number;
    private matrixSize = 7;
    private cellWidth: number;
    private cellHeight: number;
    private readonly subscribers: Array<CanvasElement>;
    private readonly matrix: Cell[] = [
        "0", "0", "0", "dealer-points", "0", "0", "0",
        "0", "0", "0", "dealer-seat", "0", "0", "0",
        "0", "0", "player-points", "0", "0", "0", "0",
        "chips", "0", "0", "player-seat", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
    ];

    public constructor(width: number, height: number) {
        this.width = 2;
        this.height = 2;
        if (height < width) {
            const ratio = width / height;
            this.width = 2 * ratio;
        } else if (width < height) {
            const ratio = height / width;
            this.height = 2 * ratio;
        }
        this.cellWidth = this.width / this.matrixSize;
        this.cellHeight = this.height / this.matrixSize;
        // this.cellWidth = Math.trunc((this.width / this.matrixSize) * 100) / 100;
        // this.cellHeight = Math.trunc((this.height / this.matrixSize) * 100) / 100;
        this.subscribers = [];
    }

    public addSubscriber(subscribers: Array<CanvasElement>): void {
        subscribers.forEach((subscriber) => this.subscribers.push(subscriber));
    }

    public update(width: number, height: number): void {
        if (height < width) {
            const ratio = width / height;
            this.width = 2 * ratio;
        } else if (width < height) {
            const ratio = height / width;
            this.height = 2 * ratio;
        }
        this.cellWidth = this.width / this.matrixSize;
        this.cellHeight = this.height / this.matrixSize;
        this.notify();
    }

    public getMatrix(): Cell[] {
        return this.matrix;
    }

    public getCellWidth(): number {
        return this.cellWidth;
    }

    public getCellHeight(): number {
        return this.cellHeight;
    }

    public getMatrixSize(): number {
        return this.matrixSize;
    }

    public getMatrixWidth(): number {
        return this.width;
    }

    public getMatrixHeight(): number {
        return this.height;
    }

    private notify(): void {
        this.subscribers.forEach((subscriber) => subscriber.update({
            width: this.width,
            height: this.height,
            cellHeight: this.cellHeight,
            cellWidth: this.cellWidth,
            map: this.matrix,
            size: this.matrixSize,
        }));
    }
}
