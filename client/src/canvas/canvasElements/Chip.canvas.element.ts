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
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { ChipItem } from "../../types/types";
import { chipRadius } from "../../constants/canvas.constants";
import { Controller } from "../Controller";

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
                // game.ui.addBet(this.chip.value);
            }),
        );
        this.skin = MeshBuilder.CreateDisc("chip", { radius: chipRadius }, this.base.scene);
        this.skin.position = position;

        const chipMaterial = new StandardMaterial("chip-material", this.base.scene);
        const chipTexture = new Texture(this.chip.img, this.base.scene, undefined, false);
        chipMaterial.diffuseTexture = chipTexture;
        // chipTexture.hasAlpha = true;
        this.skin.material = chipMaterial;
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

    private addContent(): void {
        // this.chipMesh = MeshBuilder.CreateDisc("chip", { radius: chipRadius }, this.base.scene);
        // this.chipMesh.position.x = this.position.x;
        // this.chipMesh.position.y = this.position.y;

        // const chipMaterial = new StandardMaterial("chip-material", this.base.scene);
        // const chipTexture = new Texture(this.chip.img, this.base.scene, undefined, false);
        // chipMaterial.diffuseTexture = chipTexture;
        // // chipTexture.hasAlpha = true;
        // this.chipMesh.material = chipMaterial;
        // this.chipMesh.actionManager = new ActionManager(this.base.scene);
    }
}
