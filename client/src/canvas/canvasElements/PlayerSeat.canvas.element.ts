import { CanvasBase } from "../CanvasBase";
import { GameMatrix } from "../GameMatrix";
import { SeatBaseCanvasElement } from "./SeatBase.canvas.element";

export class PlayerSeatCanvasElement extends SeatBaseCanvasElement {
    public constructor(base: CanvasBase, matrix: GameMatrix) {
        super(base, matrix, "player");
    }
}
