import {
    GroundMesh,
    Vector3,
    Scene,
    MeshBuilder,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui/2D";
import { handSize, pointsTextblockSize } from "../../constants/canvas.constants";

export class PointsCanvasElement extends GroundMesh {
    private readonly scene: Scene;
    private readonly _skin: GroundMesh;
    private _handID: string;
    private textBlock: TextBlock;

    public constructor(scene: Scene, handID: string, handPosition: Vector3) {
        super(`points-container-${handID}`, scene);
        this.scene = scene;
        this._handID = handID;

        this._skin = MeshBuilder.CreateGround(`points-${handID}`, {
            width: pointsTextblockSize.width,
            height: pointsTextblockSize.height,
        });
        this._skin.setParent(this);

        this.position = new Vector3(
            handPosition.x - handSize.width * 1.3,
            handPosition.y + handSize.width * 0.45,
            handPosition.z,
        );

        this.rotation.x = -Math.PI * 0.5;

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

    public update(points: number): void {
        this.textBlock.text = points.toString();
    }
}
