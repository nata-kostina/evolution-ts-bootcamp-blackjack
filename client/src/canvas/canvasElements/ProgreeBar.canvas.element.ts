/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    BackgroundMaterial,
    Color3,
    DynamicTexture,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import ChipImg from "../../assets/img/chips/chip_5.png";

export class ProgressBarCanvasElement {
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase) {
        this.base = base;
    }

    public addContent(): void {
        console.log("CardCanvasElement addContent");
        const chip = MeshBuilder.CreateDisc("chip", { radius: 0.7 }, this.base.scene);
        const chipMaterial = new StandardMaterial("chip-material", this.base.scene);
        const chipTexture = new Texture(ChipImg, this.base.scene, undefined, false);
        chipMaterial.diffuseTexture = chipTexture;
        chipTexture.hasAlpha = true;
        chip.material = chipMaterial;
    }
}
