/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ActionManager,
    Color3,
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
import { ChipAnimation, HelperAnimation } from "../../types/canvas.types";
import { getChipAnimation } from "../utils/animation/chip.animation";
import { getHelperAnimation } from "../utils/animation/helper.animation";
import { handSize, helperSize } from "../../constants/canvas.constants";

export class HelperCanvasElement {
    private readonly _base: CanvasBase;
    private _skin: Mesh;

    public constructor(base: CanvasBase, handPosition: Vector3) {
        this._base = base;

        this._skin = MeshBuilder.CreateCylinder("helper", {
            tessellation: 3,
            height: helperSize.height,
            diameter: helperSize.diameter,
        });
        this._skin.rotation.y = Math.PI * 0.5;
        this._skin.rotation.z = -Math.PI * 0.5;

        const helperMaterial = new StandardMaterial("material", this._base.scene);
        helperMaterial.diffuseColor = new Color3(1, 0, 1);
        this._skin.material = helperMaterial;

        this._skin.position = new Vector3(handPosition.x,
            handPosition.y + handSize.height * 0.5 + helperSize.diameter,
            handPosition.z - helperSize.diameter);
    }

    public update(position: Vector3): void {
        this._skin.position = position;
    }

    public async animate(type: HelperAnimation, onFinish?: () => void): Promise<void> {
        switch (type) {
            case HelperAnimation.Pulse:
                const { frameRate, animationArray } = getHelperAnimation(
                    this._skin.position,
                );
                this._base.scene.beginDirectAnimation(
                    this._skin,
                    animationArray,
                    0,
                    frameRate * 2,
                    true,
                    2.5,
() => {
    if (onFinish) {
        onFinish();
    }
});
                break;
            default:
                break;
        }
    }

    public dispose(): void {
        this._skin.dispose();
    }

    public setParent(parent: TransformNode): void {
        this._skin.parent = parent;
    }
}
