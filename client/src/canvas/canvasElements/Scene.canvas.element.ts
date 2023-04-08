/* eslint-disable no-trailing-spaces */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { Card, NewCard, UnholeCardPayload } from "../../types/types";
import { PlayerSeatCanvasElement } from "./PlayerSeat.canvas.element";
import { DealerSeatCanvasElement } from "./DealerSeat.canvas.element copy";
import { GameMatrix } from "../GameMatrix";
import { ChipSetCanvasElement } from "./ChipSet.canvas.element";
import { Controller } from "../Controller";
import { BlackjackNotificationCanvasElement } from "./BlackjackNotification.canvas.element";
import { isHoleCard } from "../../utils/gameUtils/isHoleCard";

export class SceneCanvasElement {
    public playerSeat: PlayerSeatCanvasElement;
    public dealerSeat: DealerSeatCanvasElement;
    public chipSet: ChipSetCanvasElement;
    private readonly base: CanvasBase;
    private readonly gameMatrix: GameMatrix;

    public constructor(base: CanvasBase, matrix: GameMatrix, controller: Controller) {
        console.log("SCENE CONSTRUCTOR");
        this.base = base;
        this.gameMatrix = matrix;
        this.addContent();
        this.playerSeat = new PlayerSeatCanvasElement(this.base, matrix);
        this.dealerSeat = new DealerSeatCanvasElement(this.base, matrix);
        this.chipSet = new ChipSetCanvasElement(this.base, this.gameMatrix, controller);
        this.gameMatrix.addSubscriber([this.chipSet]);
    }

    public addContent(): void {
        this.boot().then(() => {
            const matrix = this.gameMatrix.getMatrix();
            const matrixSize = this.gameMatrix.getMatrixSize();
            const cellWidth = this.gameMatrix.getCellWidth();
            const cellHeight = this.gameMatrix.getCellHeight();
            const matrixWidth = this.gameMatrix.getMatrixWidth();
            const matrixHeight = this.gameMatrix.getMatrixHeight();
        
            for (let i = 0; i < matrix.length; i++) {
                const cellType = matrix[i];
                const row = Math.floor(i / matrixSize);
                const column = i % matrixSize;
                const position = new Vector3(
                    -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
                    matrixHeight * 0.5 - (cellHeight * 0.5 + cellHeight * row),
                    0,
                );
                // console.log(`Row: ${row}, Column: ${column}, position: ${position}`);
                // if (cellType === "chips") {
                //     this.chipSet.addContent();
                // }
            }
        });
    }

    public dealPlayerCard(newCard: NewCard): void {
        this.playerSeat.dealCard(newCard.card as Card);
        this.playerSeat.updatePoints(newCard.points);
    }

    public dealDealerCard(newCard: NewCard): void {
        this.dealerSeat.dealCard(newCard.card);
        if (!isHoleCard(newCard.card)) {
            this.dealerSeat.updatePoints(newCard.points);
        }
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.toggleChipAction(register);
    }

    public addBlackjackNotification(): void {
        const notification = new BlackjackNotificationCanvasElement(this.base);
    }

    public removeCards(): void {
        this.playerSeat.removeCards();
        this.dealerSeat.removeCards();
    }

    public unholeCard(payload: UnholeCardPayload): void {
        this.dealerSeat.unholeCard(payload.card);
        this.dealerSeat.updatePoints(payload.points);
    }

    private async boot(): Promise<void> {}
}
