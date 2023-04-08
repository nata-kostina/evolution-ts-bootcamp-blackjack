import {
    MeshBuilder,
    GroundMesh,
    Vector3,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui/2D";
import { Cell } from "../../types/canvas.types";
import { CanvasBase } from "../CanvasBase";
import { GameMatrix } from "../GameMatrix";

export class PointsCanvasElement {
    private id: Cell;
    private position: Vector3;
    private textBlock: TextBlock | null = null;
    private skin: GroundMesh | null = null;
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase, id: Cell, matrix: GameMatrix) {
        this.base = base;
        this.id = id;

        this.base = base;

        const mtx = matrix.getMatrix();
        const mtxSize = matrix.getMatrixSize();
        const cellWidth = matrix.getCellWidth();
        const cellHeight = matrix.getCellHeight();
        const matrixWidth = matrix.getMatrixWidth();
        const matrixHeight = matrix.getMatrixHeight();
        const index = mtx.indexOf(id);

        const row = Math.floor(index / mtxSize);
        const column = index % mtxSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );
        this.addContent();
    }

    public addContent(): void {
        this.skin = MeshBuilder.CreateGround(`points-${this.id}`, { width: 0.5, height: 0.2 }, this.base.scene);
        // points.scaling = new Vector3(0.2, 0.2, 0.2);
        this.skin.position.x = this.position.x;
        this.skin.position.y = this.position.y;
        this.skin.rotation.x = -Math.PI * 0.5;

        const texture = AdvancedDynamicTexture.CreateForMesh(this.skin);
        texture.background = "#17515E";
        this.textBlock = new TextBlock(`text-points-${this.id}`, "0");
        this.textBlock.color = "white";
        this.textBlock.fontSize = 350;

        texture.addControl(this.textBlock);
    }

    public update(points: number): void {
        if (this.textBlock) {
            this.textBlock.text = points.toString();
        }
    }

    public dispose(): void {
        if (this.skin) {
            this.skin.dispose();
        }
    }
}
