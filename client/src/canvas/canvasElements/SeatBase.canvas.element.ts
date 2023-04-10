/* eslint-disable @typescript-eslint/no-unused-vars */
import { Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { PointsCanvasElement } from "./Points.canvas.element";
import { GameMatrix } from "../GameMatrix";
import { CardCanvasElement } from "./Card.canvas.element";
import { isNormalCard } from "../../utils/gameUtils/isHoleCard";
import { NewCard } from "../../types/game.types";
import { CardAnimation } from "../../types/canvas.types";

export class SeatBaseCanvasElement {
    private readonly base: CanvasBase;
    private position: Vector3;
    private cards: Array<CardCanvasElement> = [];
    private pointsElement: PointsCanvasElement | null = null;
    private matrix: GameMatrix;
    private playerType: "player" | "dealer";

    public constructor(base: CanvasBase, matrix: GameMatrix, playerType: "player" | "dealer") {
        this.base = base;
        this.matrix = matrix;
        this.playerType = playerType;

        const mtx = matrix.getMatrix();
        const mtxSize = matrix.getMatrixSize();
        const cellWidth = matrix.getCellWidth();
        const cellHeight = matrix.getCellHeight();
        const matrixWidth = matrix.getMatrixWidth();
        const matrixHeight = matrix.getMatrixHeight();
        const index = mtx.indexOf(playerType === "player" ? "player-seat" : "dealer-seat");

        const row = Math.floor(index / mtxSize);
        const column = index % mtxSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );
    }

    public async dealCard(newCard: NewCard): Promise<void> {
        const cardElement = new CardCanvasElement(this.base, this.matrix, new Vector3(
            this.position.x + this.cards.length * 0.13,
            this.position.y,
            this.position.z - this.cards.length * 0.1,
        ), newCard.card);
        this.cards.push(cardElement);
        await cardElement.addContent();
        console.log("after await cardElement.addContent()");
        cardElement.animate(CardAnimation.Deal, () => {
            if (isNormalCard(newCard.card)) {
                this.updatePoints(newCard.points);
            }
        });
    }

    public updatePoints(points: number): void {
        if (!this.pointsElement) {
            this.pointsElement = new PointsCanvasElement(
                this.base,
                this.playerType === "player" ? "player-points" : "dealer-points",
                this.matrix);
        }
        this.pointsElement.update(points);
    }

    public getBase(): CanvasBase {
        return this.base;
    }

    // public getCards(): Array<Card | HoleCard> {
    //     return this.cards;
    // }

    public async removeCards(): Promise<void> {
        this.cards.forEach((card) => { card.animate(CardAnimation.Remove); });
        this.cards = [];
        if (this.pointsElement) {
            this.pointsElement.dispose();
            this.pointsElement = null;
        }
    }

    public getCards(): Array<CardCanvasElement> {
        return this.cards;
    }

    public getMatrix(): GameMatrix {
        return this.matrix;
    }

    public addCard(card: CardCanvasElement): void {
        this.cards.push(card);
    }
}
