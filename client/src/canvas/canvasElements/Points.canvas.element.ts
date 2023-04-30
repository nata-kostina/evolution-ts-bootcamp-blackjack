import {
    GroundMesh,
    Vector3,
    Scene,
    MeshBuilder,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui/2D";
import { betTextblockSize, handSize, pointsTextblockSize } from "../../constants/canvas.constants";

export class PointsCanvasElement extends GroundMesh {
    private readonly scene: Scene;
    private readonly _skin: GroundMesh;
    private _handID: string;
    private textBlock: TextBlock;

    public constructor(scene: Scene, handID: string) {
        super(`points-container-${handID}`, scene);
        this.scene = scene;
        this._handID = handID;

        this._skin = MeshBuilder.CreateGround(`points-${handID}`, {
            width: pointsTextblockSize.width,
            height: pointsTextblockSize.height,
        });
        this._skin.setParent(this);

        this.position = new Vector3(
            -handSize.width * 0.5 - betTextblockSize.width * 0.5,
            0.08,
            handSize.width * 0.45,
        );

        const texture = AdvancedDynamicTexture.CreateForMesh(this._skin);
        texture.background = "#113C45";
        this.textBlock = new TextBlock(`text-points-${this._handID}`, "0");
        this.textBlock.color = "white";
        this.textBlock.fontSize = 350;

        texture.addControl(this.textBlock);
    }

    public get skin(): GroundMesh {
        return this._skin;
    }

    public update(points: Array<number>): void {
        this.textBlock.text = points.join("/");
    }
}
