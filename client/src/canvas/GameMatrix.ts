import { Cell } from "../types/canvas.types";

export interface CanvasElement {
    update: (data: GameMatrix) => void;
}

export class GameMatrix {
    private _width: number;
    private _height: number;
    private _colNum = 7;
    private _rowNum = 8;
    private _cellWidth: number;
    private _cellHeight: number;
    private readonly _subscribers: Array<CanvasElement>;
    private readonly _matrix: Cell[] = [
        "0", "0", "0", "dealer-seat", "0", "0", "0",
        "chips", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "player-seat", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0",
    ];

    public constructor(width: number, height: number) {
        this._width = 2;
        this._height = 2;
        if (height < width) {
            const ratio = width / height;
            this._width = 2 * ratio;
        } else if (width < height) {
            const ratio = height / width;
            this._height = 2 * ratio;
        }
        this._cellWidth = this._width / this._colNum;
        this._cellHeight = this._height / this._rowNum;
        this._subscribers = [];
    }

    public addSubscriber(subscribers: Array<CanvasElement>): void {
        subscribers.forEach((subscriber) => this._subscribers.push(subscriber));
    }

    public update(width: number, height: number): void {
        if (height < width) {
            const ratio = width / height;
            this._width = 2 * ratio;
        } else if (width < height) {
            const ratio = height / width;
            this._height = 2 * ratio;
        }
        this._cellWidth = this._width / this._colNum;
        this._cellHeight = this._height / this._rowNum;
        this.notify();
    }

    public get matrix(): Cell[] {
        return this._matrix;
    }

    public get cellWidth(): number {
        return this._cellWidth;
    }

    public get cellHeight(): number {
        return this._cellHeight;
    }

    public get matrixWidth(): number {
        return this._width;
    }

    public get matrixHeight(): number {
        return this._height;
    }

    public get colNum(): number {
        return this._colNum;
    }

    public get rowNum(): number {
        return this._rowNum;
    }

    private notify(): void {
        this._subscribers.forEach((subscriber) => subscriber.update(this));
    }
}
