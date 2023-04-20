/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    ActionManager,
    ExecuteCodeAction,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Texture,
    Vector3,
    Vector4,
} from "@babylonjs/core";
import { Controller } from "../Controller";
import { ChipItem } from "../../types/game.types";
import { chipSize } from "../../constants/canvas.constants";

export class ChipCanvasElement extends Mesh {
    private readonly scene: Scene;
    private readonly _id: string;
    private readonly _skin: Mesh;
    private readonly chip: ChipItem;
    private action: ExecuteCodeAction;

    public constructor(scene: Scene, position: Vector3, chip: ChipItem, controller: Controller) {
        super(`chip-${chip.id}`, scene);
        this.scene = scene;
        this._id = chip.id;
        this.chip = chip;
        this.action = new ExecuteCodeAction(
            {
                trigger: ActionManager.OnPickTrigger,
            },
            (() => {
                controller.addBet({ value: this.chip.value, id: this._id });
            }),
        );

        const chipMaterial = new StandardMaterial("material", this.scene);
        chipMaterial.diffuseTexture = new Texture(this.chip.img, this.scene, { invertY: true });

        const faceUV = [];
        faceUV[0] = new Vector4(0, 0, 0.25, 1);
        faceUV[1] = new Vector4(0.25, 0, 0.75, 1);
        faceUV[2] = new Vector4(0.75, 0, 1, 1);

        this._skin = MeshBuilder.CreateCylinder(`chip-skin-${chip.id}`,
            { height: chipSize.height, diameter: chipSize.diameter, faceUV: faceUV },
            this.scene);
        this._skin.setParent(this);
        this._skin.material = chipMaterial;
        this._skin.rotation.x = -Math.PI * 0.5;
        this.position = position;

        this._skin.actionManager = new ActionManager(this.scene);
    }

    public update(position: Vector3): void {
        this.position = position;
    }

    public toggleChipAction(register: boolean): void {
        if (this._skin.actionManager) {
            if (register) {
                this._skin.actionManager.registerAction(this.action);
            } else {
                this._skin.actionManager.unregisterAction(this.action);
            }
        }
    }
}
