import { Vector3, Scene } from "@babylonjs/core";
import { chipRadius } from "../../constants/canvas.constants";
import { CanvasElement, GameMatrix } from "../GameMatrix";
import { chipSet } from "../../constants/game.constants";
import { ChipCanvasElement } from "./Chip.canvas.element";
import { CanvasController } from "../CanvasController";
import { getPositionFromMatrix } from "../utils/getPositionFromMatrix";

export class ChipSetCanvasElement implements CanvasElement {
    private readonly scene: Scene;
    private readonly controller: CanvasController;
    private chipSet: Array<ChipCanvasElement> = [];
    private _position: Vector3;

    public constructor(scene: Scene, matrix: GameMatrix, controller: CanvasController) {
        this.scene = scene;
        this.controller = controller;
        this._position = getPositionFromMatrix(matrix, "chips");
    }

    public get position(): Vector3 {
        return this._position;
    }

    public update(matrix: GameMatrix): void {
        this._position = getPositionFromMatrix(matrix, "chips");
        this.chipSet.forEach((chip, idx) => {
            chip.update(new Vector3(
                this._position.x - chipRadius * 2,
                this._position.y - idx * chipRadius * 2 * 1.1,
                0,
            ));
        });
    }

    public addContent(): void {
        for (let j = 0; j < chipSet.length; j++) {
            const x = this._position.x - chipRadius * 2;
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
