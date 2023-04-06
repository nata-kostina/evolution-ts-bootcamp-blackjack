import { CanvasBase } from "../CanvasBase";
import { HoleCard } from "../../types/types";
import { SeatBaseCanvasElement } from "./SeatBase.canvas.element";
import { GameMatrix } from "../GameMatrix";

export class DealerSeatCanvasElement extends SeatBaseCanvasElement {
    private holeCard: HoleCard | null = null;

    public constructor(base: CanvasBase, matrix: GameMatrix) {
        super(base, matrix, "dealer-seat");
    }
}
