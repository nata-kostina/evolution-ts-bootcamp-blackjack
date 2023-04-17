/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    ActionManager,
    ExecuteCodeAction,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Texture,
    TransformNode,
    Vector3,
    Vector4,
    Scene,
    AxesViewer,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { chipRadius } from "../../constants/canvas.constants";
import { ChipItem } from "../../types/game.types";
import { ChipAnimation } from "../../types/canvas.types";
import { getChipAnimation } from "../utils/animation/chip.animation";
import { assertUnreachable } from "../../utils/assertUnreachable";

export class BetChipCanvasElement extends Mesh {
    private readonly scene: Scene;
    private readonly _skin: Mesh;
    private readonly chip: ChipItem;
    private _finalPosition: Vector3 | null = null;

    public constructor(scene: Scene, chip: ChipItem) {
        super(`bet-chip-${chip.id}`, scene);
        this.scene = scene;
        this.chip = chip;

        const chipMaterial = new StandardMaterial("material", this.scene);
        chipMaterial.diffuseTexture = new Texture(this.chip.img, this.scene, { invertY: true });

        const faceUV = [];
        faceUV[0] = new Vector4(0, 0, 0.25, 1);
        faceUV[1] = new Vector4(0.25, 0, 0.75, 1);
        faceUV[2] = new Vector4(0.75, 0, 1, 1);

        this._skin = MeshBuilder.CreateCylinder(`chip-${chip.id}`,
            { height: 0.02, diameter: chipRadius * 2, faceUV: faceUV },
            this.scene);
        this._skin.setParent(this);
        this._skin.material = chipMaterial;

        this._skin.rotation.x = -Math.PI * 0.5;

        // this.position = parentChipPosition;
        // console.log("parentChipPosition: ", parentChipPosition);
        // this.position = new Vector3(parentChipPosition.x, parentChipPosition.y + 0.01, parentChipPosition.z);

        // const localAxes = new AxesViewer(this.scene, 1);
        // localAxes.xAxis.parent = this;
        // localAxes.yAxis.parent = this;
        // localAxes.zAxis.parent = this;
    }

    public get chipValue(): number {
        return this.chip.value;
    }

    public set finalPosition(position: Vector3) {
        this._finalPosition = position;
    }

    public async animate(type: ChipAnimation, onFinish?: () => void): Promise<void> {
        let initPosition;
        let finalPosition = this._finalPosition || new Vector3(-10, -10, -10);
        switch (type) {
            case ChipAnimation.Add:
                initPosition = this.position;
                break;
            case ChipAnimation.Remove:
                initPosition = this.position;
                break;
            case ChipAnimation.Lose:
                initPosition = this.position;
                finalPosition = new Vector3(this.position.x, 5, this.position.z);
                break;
            case ChipAnimation.Win:
                initPosition = this.position;
                finalPosition = new Vector3(this.position.x, -5, this.position.z);
                break;
            default:
                assertUnreachable(type);
        }

        const { frameRate, animationArray } = getChipAnimation(
            initPosition,
            finalPosition,
        );

        const chipAnim = this.scene.beginDirectAnimation(
            this,
            animationArray,
            0,
            frameRate,
            false,
            2.5,
            () => {
                if (onFinish) {
                    onFinish();
                }
            });
        await chipAnim.waitAsync();
    }
}
