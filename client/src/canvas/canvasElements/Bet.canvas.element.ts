import uuid from "react-uuid";
import {
    MeshBuilder,
    Vector3,
    GroundMesh,
    Mesh,
    TransformNode,
    Scene,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { ChipAnimation, IBetCanvasElement } from "../../types/canvas.types";
import { chipSet } from "../../constants/game.constants";
import { BetChipCanvasElement } from "./BetChip.canvas.elemenr";
import { getChipImg } from "../utils/getChipImg";
import { chipSize, handSize, betTextblockSize } from "../../constants/canvas.constants";

export class BetCanvasElement extends TransformNode implements IBetCanvasElement {
    private readonly scene: Scene;
    private readonly _handID: string;
    private readonly _textGround: GroundMesh;
    private readonly _textBlock: TextBlock;
    private readonly _chipsStack: Array<BetChipCanvasElement> = [];

    public constructor(scene: Scene, handID: string) {
        super(`bet-${handID}`, scene);
        this.scene = scene;
        this._handID = handID;

        this._textGround = MeshBuilder.CreateGround(`bet-text--${this._handID}`,
            { width: betTextblockSize.width, height: betTextblockSize.height },
            this.scene);
        this._textGround.setParent(this);

        this.position = new Vector3(
            0,
            0,
            -handSize.height * 0.5 - betTextblockSize.height * 0.5);

        const texture = AdvancedDynamicTexture.CreateForMesh(this._textGround);

        this._textBlock = new TextBlock(`text-points-${this._handID}`, "$0");
        this._textBlock.color = "white";
        this._textBlock.fontSize = 250;

        texture.addControl(this._textBlock);
    }

    public get chips(): Array<BetChipCanvasElement> {
        return this._chipsStack;
    }

    public async addChip(value: number): Promise<void> {
        const chipConstant = chipSet.find((chip) => chip.value === value);
        if (chipConstant) {
            const setChip = this.scene.getMeshByName(`chip-${chipConstant.id}`) as Mesh;
            if (setChip) {
                const chip = new BetChipCanvasElement(this.scene,
                    { id: uuid(), img: getChipImg(value), value, name: `chip-${value}` },
                );
                chip.position = new Vector3().copyFrom(setChip.position);
                this._chipsStack.push(chip);
                chip.finalPosition = new Vector3(
                    (Math.random() * 0.08 - 0.05) - betTextblockSize.width,
                    this._chipsStack.length * chipSize.height * 1.1,
                    (Math.random() * 0.08 - 0.05) + 0.06,
                );

                chip.setParent(this);
                await chip.animate(ChipAnimation.Add);
            }
        }
    }

    public async removeChip(): Promise<void> {
        const lastChip = this._chipsStack.pop();
        if (lastChip) {
            const chipConstant = chipSet.find((chip) => chip.value === lastChip.chipValue);
            if (chipConstant) {
                const setChip = this.scene.getMeshByName(`chip-${chipConstant.id}`) as Mesh;
                lastChip.setParent(setChip);
                lastChip.finalPosition = new Vector3(0, 0, 0);
                await lastChip.animate(ChipAnimation.Remove, () => {
                    lastChip.dispose();
                });
            } else {
                lastChip.dispose();
            }
        }
    }

    public updateBet(bet: number): void {
        this._textBlock.text = `$${bet.toString()}`;
    }
}
