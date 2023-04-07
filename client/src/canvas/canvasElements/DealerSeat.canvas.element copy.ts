import { CanvasBase } from "../CanvasBase";
import { SeatBaseCanvasElement } from "./SeatBase.canvas.element";
import { GameMatrix } from "../GameMatrix";

export class DealerSeatCanvasElement extends SeatBaseCanvasElement {
    public constructor(base: CanvasBase, matrix: GameMatrix) {
        super(base, matrix, "dealer");
    }
}
