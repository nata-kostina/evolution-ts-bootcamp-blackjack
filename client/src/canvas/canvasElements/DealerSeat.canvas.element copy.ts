/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransformNode, Vector3, Scene } from "@babylonjs/core";
import { GameMatrix } from "../GameMatrix";
import { CardCanvasElement } from "./Card.canvas.element";
import { DealDealerCard } from "../../types/game.types";
import { CardAnimation, UnholeCardPayload } from "../../types/canvas.types";
import { isNormalCard } from "../../utils/gameUtils/isHoleCard";
import { PointsCanvasElement } from "./Points.canvas.element";
import { cardSize } from "../../constants/canvas.constants";

export class DealerSeatCanvasElement extends TransformNode {
    protected readonly scene: Scene;
    protected matrix: GameMatrix;
    private _cards: Array<CardCanvasElement> = [];
    private _pointsElement: PointsCanvasElement;

    public constructor(scene: Scene, matrix: GameMatrix) {
        super("dealer-seat", scene);
        this.scene = scene;
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
            -cardSize.height * 0.5 + matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );

        this._pointsElement = new PointsCanvasElement(
            this.scene,
            "points-dealer-seat",
            this.position,
        );
        this._pointsElement.skin.isVisible = false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async unholeCard({ card, points }: UnholeCardPayload): Promise<void> {
        if (this._cards.length === 2) {
            const holeCard = this._cards[1];
            // eslint-disable-next-line max-len
            const unholedCard = new CardCanvasElement(
                this.scene,
                holeCard.position,
                card,
            );
            unholedCard.setParent(this);

            this.cards.pop();
            this.addCard(unholedCard);
            holeCard.dispose();

            await unholedCard.addContent();
            unholedCard.setMeshPosition(holeCard.position);
            await unholedCard.animate(CardAnimation.Unhole);
            this.updatePoints(points);
        }
    }

    public async dealCard(newCard: DealDealerCard): Promise<void> {
        this._pointsElement.skin.isVisible = true;
        const cardElement = new CardCanvasElement(
            this.scene,
            new Vector3(
                this.cards.length * 0.13,
                this.position.y,
                this.position.z - this.cards.length * cardSize.depth - 0.04,
            ),
            newCard.card,
        );
        cardElement.setParent(this);
        this.cards.push(cardElement);
        await cardElement.addContent();
        await cardElement.animate(CardAnimation.Deal, () => {
            if (isNormalCard(newCard.card)) {
                this.updatePoints(newCard.points);
            }
        });
    }

    public updatePoints(points: number): void {
        this._pointsElement.update(points);
    }

    public async removeCards(): Promise<void> {
        this.cards.forEach((card) => {
            card.animate(CardAnimation.Remove);
        });
        this._cards = [];
        this._pointsElement.dispose();
    }

    public get cards(): Array<CardCanvasElement> {
        return this._cards;
    }

    public getMatrix(): GameMatrix {
        return this.matrix;
    }

    public addCard(card: CardCanvasElement): void {
        this.cards.push(card);
    }

    public reset(): void {
        this._cards.forEach((card) => card.animate(CardAnimation.Remove, () => card.dispose()));
        this._cards = [];
        this._pointsElement.skin.isVisible = false;
    }
}
