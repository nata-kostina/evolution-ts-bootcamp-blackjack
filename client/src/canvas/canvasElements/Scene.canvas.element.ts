/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BackgroundMaterial, Curve3, MeshBuilder, Texture, Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import Background from "../../assets/img/background.jpg";
import { CardCanvasElement } from "./Card.canvas.element";
import { ChipCanvasElement } from "./Chip.canvas.element";
import { Card, HoleCard, NewCard } from "../../types/types";
import { PlayerSeatCanvasElement } from "./PlayerSeat.canvas.element";
import { SceneMatrix, matrixSize, matrixWidth, cellSize, matrixHeight } from "../GameMatrix";
import { DealerSeatCanvasElement, isHoleCard } from "./DealerSeat.canvas.element copy";
import { chipSet } from "../../constants/gameConstants";
import { chipRadius } from "../../constants/canvas.constants";

export class SceneCanvasElement {
    public playerSeat: PlayerSeatCanvasElement;
    public dealerSeat: DealerSeatCanvasElement;
    public chipSet: ChipCanvasElement[] = [];
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase) {
        this.base = base;
        this.addContent();
        this.playerSeat = new PlayerSeatCanvasElement(this.base);
        this.dealerSeat = new DealerSeatCanvasElement(this.base);
    }

    public addContent(): void {
        this.boot().then(() => {
            console.log("SceneCanvasElement addContent");

            for (let i = 0; i < SceneMatrix.length; i++) {
                const cellType = SceneMatrix[i];
                const row = Math.floor(i / matrixSize);
                const column = i % matrixSize;
                const position = new Vector3(
                    -matrixWidth * 0.5 + cellSize * 0.5 + cellSize * column,
                    matrixHeight * 0.5 - (cellSize * 0.5 + cellSize * row),
                    0,
                );
                if (cellType === "chips") {
                    for (let j = 0; j < chipSet.length; j++) {
                        const x = position.x + j * chipRadius * 1.5;
                        // const y = (Math.floor(40 / 21) * position.x * position.x - Math.floor(61 / 21) * position.x + 1);
                        // console.log(`Single Chip Position: X: ${x}, Y: ${y}`);
                        const chip = new ChipCanvasElement(this.base, new Vector3(
                            x,
                            position.y,
                            0,
                        ), chipSet[j]);
                        chip.addContent();
                        this.chipSet.push(chip);
                    }
                }
            }

            // const card = new CardCanvasElement(this.base);
            // card.addContent();
            // const chip = new ChipCanvasElement(this.base);
            // chip.addContent();
            // const ground = MeshBuilder.CreateGround(
            //     "ground",
            //     { width: 4, height: 4 },
            //     this.scene,
            // );
            // ground.parent = this.camera;
            // const groundMaterial = new BackgroundMaterial(
            //     "ground-material",
            //     this.scene,
            // );
            // groundMaterial.diffuseTexture = new Texture(
            //     Background,
            // );
            // ground.material = groundMaterial;
            // console.log("add ground");
        });
    }

    public dealPlayerCard(newCard: NewCard): void {
        console.log("dealPlayerCard");
        this.playerSeat.dealCard(newCard.card as Card);
        this.playerSeat.updatePoints(newCard.points);
    }

    public dealDealerCard(newCard: NewCard): void {
        console.log("dealDealerCard", newCard);

        this.dealerSeat.dealCard(newCard.card);
        if (!isHoleCard(newCard.card)) {
            this.dealerSeat.updatePoints(newCard.points);
        }
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.forEach((chip) => chip.toggleChipAction(register));
    }

    private async boot(): Promise<void> {}
}
