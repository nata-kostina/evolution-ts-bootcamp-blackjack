/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransformNode, Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { GameMatrix } from "../GameMatrix";
import { CardCanvasElement } from "./Card.canvas.element";
import { Card, DealDealerCard } from "../../types/game.types";
import { CardAnimation, UnholeCardPayload } from "../../types/canvas.types";
import { isNormalCard } from "../../utils/gameUtils/isHoleCard";
import { PointsCanvasElement } from "./Points.canvas.element";
import { cardSize } from "../../constants/canvas.constants";

export class DealerSeatCanvasElement {
    protected readonly base: CanvasBase;
    protected matrix: GameMatrix;
    protected position: Vector3;
    private cards: Array<CardCanvasElement> = [];
    private pointsElement: PointsCanvasElement | null = null;
    private _seat: TransformNode;
    public constructor(base: CanvasBase, matrix: GameMatrix) {
        this.base = base;
        this.matrix = matrix;

        const mtx = matrix.getMatrix();
        const mtxSize = matrix.getMatrixSize();
        const cellWidth = matrix.getCellWidth();
        const cellHeight = matrix.getCellHeight();
        const matrixWidth = matrix.getMatrixWidth();
        const matrixHeight = matrix.getMatrixHeight();
        const index = mtx.indexOf("dealer-seat");

        const row = Math.floor(index / mtxSize);
        const column = index % mtxSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );

        this._seat = new TransformNode("dealer-seat");
        this._seat.position = this.position;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async unholeCard({ card, points }: UnholeCardPayload): Promise<void> {
        const cards = this.getCards();
        if (cards.length === 2) {
            const holeCard = cards[1];
            // eslint-disable-next-line max-len
            const unholedCard = new CardCanvasElement(
                this.getBase(),
                this.getMatrix(),
                holeCard.getPosition(),
                card,
            );
            this.cards.pop();
            this.addCard(unholedCard);
            holeCard.dispose();
            await unholedCard.addContent();
            unholedCard.setMeshPosition(holeCard.getPosition());
            await unholedCard.animate(CardAnimation.Unhole);
            this.updatePoints(points);
        }
    }

    public async dealCard(newCard: DealDealerCard): Promise<void> {
        const cardElement = new CardCanvasElement(
            this.base,
            this.matrix,
            new Vector3(
                this.position.x + this.cards.length * 0.13,
                this.position.y,
                this.position.z - this.cards.length * cardSize.depth - 0.04,
            ),
            newCard.card,
        );
        this.cards.push(cardElement);
        await cardElement.addContent();
        await cardElement.animate(CardAnimation.Deal, () => {
            if (isNormalCard(newCard.card)) {
                this.updatePoints(newCard.points);
            }
        });
    }

    public updatePoints(points: number): void {
        if (!this.pointsElement) {
            this.pointsElement = new PointsCanvasElement(
                this.base,
                "points-dealer-seat",
                this._seat.position);
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
        this.cards.forEach((card) => {
            card.animate(CardAnimation.Remove);
        });
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
