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
    Vector3,
    Vector4,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { chipRadius } from "../../constants/canvas.constants";
import { Controller } from "../Controller";
import { ChipItem } from "../../types/game.types";

export class ChipCanvasElement {
    private skin: Mesh;
    private action: ExecuteCodeAction;
    private readonly chip: ChipItem;
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase, position: Vector3, chip: ChipItem, controller: Controller) {
        this.base = base;
        this.chip = chip;
        this.action = new ExecuteCodeAction(
            {
                trigger: ActionManager.OnPickTrigger,
            },
            (() => {
                controller.addBet(this.chip.value);
            }),
        );

        const chipMaterial = new StandardMaterial("material", this.base.scene);
        chipMaterial.diffuseTexture = new Texture(this.chip.img, this.base.scene, { invertY: true });

        const faceUV = [];
        faceUV[0] = new Vector4(0, 0, 0.25, 1);
        faceUV[1] = new Vector4(0.25, 0, 0.75, 1);
        faceUV[2] = new Vector4(0.75, 0, 1, 1);

        this.skin = MeshBuilder.CreateCylinder(`chip-${chip.id}`,
            { height: 0.02, diameter: chipRadius * 2, faceUV: faceUV },
            this.base.scene);
        this.skin.material = chipMaterial;
        this.skin.rotation.x = -Math.PI * 0.5;
        this.skin.position = position;
        // this.skin = MeshBuilder.CreateDisc("chip", { radius: chipRadius }, this.base.scene);
        // this.skin.position = position;

        // const chipMaterial = new StandardMaterial("chip-material", this.base.scene);
        // const chipTexture = new Texture(this.chip.img, this.base.scene, undefined, false);
        // chipMaterial.diffuseTexture = chipTexture;
        // // chipTexture.hasAlpha = true;
        // this.skin.material = chipMaterial;
        this.skin.actionManager = new ActionManager(this.base.scene);
    }

    public update(position: Vector3): void {
        this.skin.position = position;
    }

    public toggleChipAction(register: boolean): void {
        if (this.skin?.actionManager) {
            if (register) {
                this.skin.actionManager.registerAction(this.action);
            } else {
                this.skin.actionManager.unregisterAction(this.action);
            }
        }
    }
}
