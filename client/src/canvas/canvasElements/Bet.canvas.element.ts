/* eslint-disable @typescript-eslint/no-unused-vars */
import uuid from "react-uuid";
import {
    MeshBuilder,
    Vector3,
    GroundMesh,
    Mesh,
    TransformNode,
    StandardMaterial,
    Color3,
    AxesViewer,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { ChipAnimation, IBetCanvasElement } from "../../types/canvas.types";
import { CanvasBase } from "../CanvasBase";
import { ChipCanvasElement } from "./Chip.canvas.element";
import { chipSet } from "../../constants/game.constants";
import { BetChipCanvasElement } from "./BetChip.canvas.elemenr";
import { getChipImg } from "../utils/getChipImg";
import { chipSize, handSize, betGroundSize, betTextblockSize, chipRadius } from "../../constants/canvas.constants";

export class BetCanvasElement implements IBetCanvasElement {
    private readonly _handID: string;
    private readonly _base: CanvasBase;
    private _container: TransformNode;
    private textGround: GroundMesh;
    private textBlock: TextBlock;
    private _chipsStack: Array<BetChipCanvasElement> = [];

    public constructor(base: CanvasBase, handPosition: Vector3, handID: string) {
        this._base = base;
        this._handID = handID;

        this._container = new TransformNode(`bet-container-${handID}`);
        this._container.position = new Vector3(
            handPosition.x,
            handPosition.y - handSize.height * 0.5,
            handPosition.z);
        // const localAxes = new AxesViewer(this._base.scene, 1);
        // localAxes.xAxis.parent = this._container;
        // localAxes.yAxis.parent = this._container;
        // localAxes.zAxis.parent = this._container;
        this.textGround = MeshBuilder.CreateGround(`bet-text--${this._handID}`,
            { width: betTextblockSize.width, height: betTextblockSize.height },
            this._base.scene);
        this.textGround.rotation.x = -Math.PI * 0.5;
        this.textGround.parent = this._container;
        this.textGround.position.y = -betTextblockSize.height * 0.5;
        const texture = AdvancedDynamicTexture.CreateForMesh(this.textGround);
        texture.background = "#17515E";
        this.textBlock = new TextBlock(`text-points-${this._handID}`, "0$");
        this.textBlock.color = "white";
        this.textBlock.fontSize = 250;

        texture.addControl(this.textBlock);
    }

    public get chips(): Array<BetChipCanvasElement> {
        return this._chipsStack;
    }

    public async addChip(value: number): Promise<void> {
        const chipConstant = chipSet.find((chip) => chip.value === value);
        if (chipConstant) {
            const setChip = this._base.scene.getMeshByName(`chip-${chipConstant.id}`) as Mesh;
            if (setChip) {
                const chip = new BetChipCanvasElement(this._base,
                    new Vector3(
                        (Math.random() * 0.08 - 0.05),
                        -betTextblockSize.height - chipRadius + (Math.random() * 0.08 - 0.05),
                        this._container.position.z - this._chipsStack.length * chipSize.height),
                    { id: uuid(), img: getChipImg(value), value },
                    setChip.position,
                );
                chip.setParent(this._container);
                this._chipsStack.push(chip);
                await chip.animate(ChipAnimation.Add);
            }
        }
    }

    public async removeChip(): Promise<void> {
        const lastChip = this._chipsStack.pop();
        if (lastChip) {
            await lastChip.animate(ChipAnimation.Remove, () => {
                lastChip.dispose();
            });
        }
    }

    public updateBet(bet: number): void {
        this.textBlock.text = `${bet.toString()}$`;
    }

    public setParent(parent: TransformNode): void {
        if (this._container) {
            this._container.parent = parent;
        }
    }
}
