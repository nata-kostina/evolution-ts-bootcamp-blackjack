import {
    Color3,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Vector3,
    Scene,
} from "@babylonjs/core";
import { HelperAnimation } from "../../types/canvas.types";
import { getHelperAnimation } from "../utils/animation/helper.animation";
import { animationSpeed, handSize, helperSize } from "../../constants/canvas.constants";

export class HelperCanvasElement extends Mesh {
    private readonly scene: Scene;
    private readonly _skin: Mesh;

    public constructor(scene: Scene, position: Vector3) {
        super("helper", scene);
        this.scene = scene;

        this._skin = MeshBuilder.CreateCylinder("helper", {
            tessellation: 3,
            height: helperSize.height,
            diameter: helperSize.diameter,
        });
        this._skin.setParent(this);

        const helperMaterial = new StandardMaterial("material", this._scene);
        helperMaterial.diffuseColor = Color3.FromHexString("#F2EEAD");
        this._skin.material = helperMaterial;

        this.position = new Vector3(position.x,
            position.y + handSize.height * 0.5 + helperSize.diameter,
            position.z - helperSize.diameter);
        this.rotation.y = Math.PI * 0.5;
        this.rotation.z = -Math.PI * 0.5;
    }

    public get skin(): Mesh {
        return this._skin;
    }

    public update(position: Vector3): void {
        this.position = new Vector3(position.x,
            position.y + handSize.height * 0.5 + helperSize.diameter,
            position.z - helperSize.diameter);
        this.animate(HelperAnimation.Pulse);
    }

    public async animate(type: HelperAnimation, onFinish?: () => void): Promise<void> {
        switch (type) {
            case HelperAnimation.Pulse:
                const { frameRate, animationArray } = getHelperAnimation(
                    this.position,
                );
                this.scene.beginDirectAnimation(
                    this,
                    animationArray,
                    0,
                    frameRate * 2,
                    true,
                    animationSpeed * 0.7,
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
}
