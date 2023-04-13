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
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { chipRadius } from "../../constants/canvas.constants";
import { ChipItem } from "../../types/game.types";
import { ChipAnimation } from "../../types/canvas.types";
import { getChipAnimation } from "../utils/animation/chip.animation";
import { assertUnreachable } from "../../utils/assertUnreachable";

export class BetChipCanvasElement {
    public readonly chip: ChipItem;
    private readonly _id: string;
    private _skin: Mesh;
    private readonly base: CanvasBase;
    private readonly parentChipPosition: Vector3;
    private readonly finalPosition: Vector3;

    public constructor(base: CanvasBase, position: Vector3, chip: ChipItem, parentChipPosition: Vector3) {
        this.base = base;
        this._id = chip.id;
        this.chip = chip;
        this.parentChipPosition = parentChipPosition;
        this.finalPosition = position;

        const chipMaterial = new StandardMaterial("material", this.base.scene);
        chipMaterial.diffuseTexture = new Texture(this.chip.img, this.base.scene, { invertY: true });

        const faceUV = [];
        faceUV[0] = new Vector4(0, 0, 0.25, 1);
        faceUV[1] = new Vector4(0.25, 0, 0.75, 1);
        faceUV[2] = new Vector4(0.75, 0, 1, 1);

        this._skin = MeshBuilder.CreateCylinder(`chip-${chip.id}`,
            { height: 0.02, diameter: chipRadius * 2, faceUV: faceUV },
            this.base.scene);
        this._skin.material = chipMaterial;
        this._skin.rotation.x = -Math.PI * 0.5;
        this._skin.position = position;
    }

    public update(position: Vector3): void {
        this._skin.position = position;
    }

    public async animate(type: ChipAnimation, onFinish?: () => void): Promise<void> {
        let initPosition;
        let finalPosition;
        switch (type) {
            case ChipAnimation.Add:
                initPosition = this.parentChipPosition;
                finalPosition = this._skin.position;
                break;
            case ChipAnimation.Remove:
                initPosition = this._skin.position;
                finalPosition = this.parentChipPosition;
                break;
            case ChipAnimation.Lose:
                initPosition = this._skin.position;
                finalPosition = new Vector3(this._skin.position.x, 5, this._skin.position.z);
                break;
            case ChipAnimation.Win:
                initPosition = this._skin.position;
                finalPosition = new Vector3(this._skin.position.x, -5, this._skin.position.z);
                break;
            default:
                assertUnreachable(type);
        }

        const { frameRate, animationArray } = getChipAnimation(
            type,
            initPosition,
            finalPosition,
        );

        const chipAnim = this.base.scene.beginDirectAnimation(
            this._skin,
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

    public dispose(): void {
        this._skin.dispose();
    }

    public setParent(parent: TransformNode): void {
        this._skin.parent = parent;
    }
}
