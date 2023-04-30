import { TransformNode, Vector3, Scene, Axis, Space } from "@babylonjs/core";
import { CanvasElement, GameMatrix } from "../GameMatrix";
import { CardCanvasElement } from "./Card.canvas.element";
import { DealDealerCard } from "../../types/game.types";
import { CardAnimation, UnholeCardPayload } from "../../types/canvas.types";
import { isNormalCard } from "../../utils/game/isNormalCard";
import { PointsCanvasElement } from "./Points.canvas.element";
import { cardSize } from "../../constants/canvas.constants";
import { getPositionFromMatrix } from "../utils/getPositionFromMatrix";

export class DealerSeatCanvasElement extends TransformNode implements CanvasElement {
    protected readonly scene: Scene;
    private readonly _pointsElement: PointsCanvasElement;
    private _cards: Array<CardCanvasElement> = [];

    public constructor(scene: Scene, matrix: GameMatrix) {
        super("dealer-seat", scene);
        this.scene = scene;

        this.position = getPositionFromMatrix(matrix, "dealer-seat");
        this.rotate(Axis.X, -Math.PI * 0.5, Space.LOCAL);
        this._pointsElement = new PointsCanvasElement(
            this.scene,
            "points-dealer-seat",
        );
        this._pointsElement.parent = this;
        this._pointsElement.skin.isVisible = false;
    }

    public get cards(): Array<CardCanvasElement> {
        return this._cards;
    }

    public async unholeCard({ card, points }: UnholeCardPayload): Promise<void> {
        if (this._cards.length === 2) {
            const holeCard = this._cards[1];
            const unholedCard = new CardCanvasElement(this.scene, holeCard.position, card);
            unholedCard.setParent(this);

            this._cards.pop();
            this.addCard(unholedCard);
            holeCard.dispose();

            await unholedCard.addContent();
            unholedCard.position = holeCard.position;
            await unholedCard.animate(CardAnimation.Unhole);
            this.updatePoints(points);
        }
    }

    public async dealCard(newCard: DealDealerCard): Promise<void> {
        const cardElement = new CardCanvasElement(
            this.scene,
            new Vector3(
                this._cards.length * 0.13,
                this._cards.length * cardSize.depth - 0.04,
                0,
            ),
            newCard.card,
        );
        cardElement.setParent(this);
        this._cards.push(cardElement);
        await cardElement.addContent();
        await cardElement.animate(CardAnimation.Deal, () => {
            if (isNormalCard(newCard.card)) {
                this.updatePoints(newCard.points);
            }
        });
        this._pointsElement.skin.isVisible = true;
    }

    public updatePoints(points: number): void {
        this._pointsElement.update([points]);
    }

    public removeCards(): void {
        this._cards.map((card) => card.animate(CardAnimation.Remove));
        this._cards = [];
        this._pointsElement.dispose();
    }

    public addCard(card: CardCanvasElement): void {
        this._cards.push(card);
    }

    public reset(): void {
        this._cards.map((card) => card.animate(CardAnimation.Remove, () => card.dispose()));
        this._cards = [];
        this._pointsElement.skin.isVisible = false;
    }

    public update(matrix: GameMatrix): void {
        this.position = getPositionFromMatrix(matrix, "dealer-seat");
    }
}
