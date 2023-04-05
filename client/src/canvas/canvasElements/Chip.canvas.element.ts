/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    ActionManager,
    BackgroundMaterial,
    Color3,
    DynamicTexture,
    ExecuteCodeAction,
    InterpolateValueAction,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import ChipImg from "../../assets/img/chips/chip_5.png";
import { ChipItem } from "../../types/types";
import { chipRadius } from "../../constants/canvas.constants";

export class ChipCanvasElement {
    private chipMesh: Mesh | null = null;
    private position: Vector3;
    private action: ExecuteCodeAction;
    private readonly chip: ChipItem;
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase, position: Vector3, chip: ChipItem) {
        this.base = base;
        this.position = position;
        this.chip = chip;
        this.action = new ExecuteCodeAction(
            {
                trigger: ActionManager.OnPickTrigger,
            },
            (() => {
                // game.ui.addBet(this.chip.value);
            }),
        );
    }

    public addContent(): void {
        this.chipMesh = MeshBuilder.CreateDisc("chip", { radius: chipRadius }, this.base.scene);
        this.chipMesh.position.x = this.position.x;
        this.chipMesh.position.y = this.position.y;

        const chipMaterial = new StandardMaterial("chip-material", this.base.scene);
        const chipTexture = new Texture(this.chip.img, this.base.scene, undefined, false);
        chipMaterial.diffuseTexture = chipTexture;
        // chipTexture.hasAlpha = true;
        this.chipMesh.material = chipMaterial;
        this.chipMesh.actionManager = new ActionManager(this.base.scene);
    }

    public toggleChipAction(register: boolean): void {
        if (this.chipMesh?.actionManager) {
            if (register) {
                this.chipMesh.actionManager.registerAction(this.action);
            } else {
                this.chipMesh.actionManager.unregisterAction(this.action);
            }
        }
    }
}
