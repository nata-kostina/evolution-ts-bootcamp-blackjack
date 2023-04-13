import {
    MeshBuilder,
    GroundMesh,
    Vector3,
    TransformNode,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui/2D";
import { handSize } from "../../constants/canvas.constants";
import { CanvasBase } from "../CanvasBase";

export class PointsCanvasElement {
    private _handID: string;
    private _position: Vector3;
    private textBlock: TextBlock | null = null;
    private _skin: GroundMesh | null = null;
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase, handID: string, handPosition: Vector3) {
        this.base = base;
        this._handID = handID;
        this._position = new Vector3(
            handPosition.x - handSize.width * 1.3,
            handPosition.y + handSize.width * 0.45,
            handPosition.z,
        );
        this.addContent();
    }

    public addContent(): void {
        this._skin = MeshBuilder.CreateGround(
      `points-${this._handID}`,
      { width: 0.5, height: 0.2 },
      this.base.scene,
        );
        this._skin.position.x = this._position.x;
        this._skin.position.y = this._position.y;
        this._skin.rotation.x = -Math.PI * 0.5;

        const texture = AdvancedDynamicTexture.CreateForMesh(this._skin);
        texture.background = "#17515E";
        this.textBlock = new TextBlock(`text-points-${this._handID}`, "0");
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
        if (this._skin) {
            this._skin.dispose();
        }
    }

    public setParent(parent: TransformNode): void {
        if (this._skin) {
            this._skin.parent = parent;
        }
    }

    public get skin(): GroundMesh | null {
        return this._skin;
    }
}
