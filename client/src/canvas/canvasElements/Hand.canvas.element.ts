import {
    Scene,
    TransformNode,
    Vector3,
} from "@babylonjs/core";
import {
    CardAnimation,
    ChipAnimation,
    HandAnimation,
} from "../../types/canvas.types";

import { DealPlayerCard, GameResult, Hand } from "../../types/game.types";
import { CardCanvasElement } from "./Card.canvas.element";
import { getSplitHandAnimation } from "../utils/animation/hand.animation";
import { PointsCanvasElement } from "./Points.canvas.element";
import { BetCanvasElement } from "./Bet.canvas.element";
import { animationSpeed, cardSize } from "../../constants/canvas.constants";

export class HandCanvasElement extends TransformNode {
    private readonly scene: Scene;
    private readonly _handID: string;
    private _cards: Array<CardCanvasElement> = [];
    private _pointsElement: PointsCanvasElement;
    private _betElement: BetCanvasElement;

    public constructor(
        scene: Scene,
        id: string,
    ) {
        super(`hand-${id}`, scene);
        this.scene = scene;
        this._handID = id;

        this._betElement = new BetCanvasElement(
            scene,
            this._handID,
        );
        this._betElement.parent = this;

        this._pointsElement = new PointsCanvasElement(
            this.scene,
            this._handID,
        );
        this._pointsElement.parent = this;
        this._pointsElement.skin.isVisible = false;
    }

    public get handID(): string {
        return this._handID;
    }

    public updateHand(hand: Hand): void {
        this._betElement.updateBet(hand.bet);
    }

    public async addCard2(newCard: DealPlayerCard): Promise<CardCanvasElement> {
        const cardElement = new CardCanvasElement(
            this.scene,
            new Vector3(
                this._cards.length * 0.13,
                this._cards.length * cardSize.depth,
                0,
            ),
            newCard.card,
        );
        cardElement.skin.parent = this;
        await cardElement.addContent();

        this._cards.push(cardElement);
        return cardElement;
    }

    public async dealCard(newCard: DealPlayerCard): Promise<void> {
        const cardElement = await this.addCard2(newCard);

        await cardElement.animate(CardAnimation.Deal);
        this.updatePoints(newCard.points);
        this._pointsElement.skin.isVisible = true;
    }

    public get chipsValue(): Array<number> {
        return this._betElement.chips.map((chip) => chip.chipValue);
    }

    public get cards(): Array<CardCanvasElement> {
        return this._cards;
    }

    public get pointsElement(): PointsCanvasElement {
        return this._pointsElement;
    }

    public addCard(card: CardCanvasElement): void {
        this._cards.push(card);
    }

    public removeCard(card: CardCanvasElement): void {
        const index = this._cards.findIndex((c) => c.cardID === card.cardID);
        if (index > -1) {
            this._cards.splice(index, 1);
        }
    }

    public get betElement(): BetCanvasElement {
        return this._betElement;
    }

    public updatePoints(points: Array<number>): void {
        this._pointsElement.update(points);
    }

    public updateBet(bet: number): void {
        this._betElement.updateBet(bet);
    }

    public async animate(
        type: HandAnimation,
        onFinish?: () => void,
    ): Promise<void> {
        if (type === HandAnimation.ToLeft || type === HandAnimation.ToRight) {
            const { frameRate, animationArray } = getSplitHandAnimation(
                type,
                this.position,
            );
            const splitAnim = this.scene.beginDirectAnimation(
                this,
                animationArray,
                0,
                frameRate,
                false,
                animationSpeed,
                () => {
                    if (onFinish) {
                        onFinish();
                    }
                },
            );
            await splitAnim.waitAsync();
        }
    }

    public async remove(gameResult: GameResult): Promise<void> {
        const pendingCardsAnimation = this._cards.map((card) => card.animate(CardAnimation.Remove));
        await Promise.all(pendingCardsAnimation);
        const pendingAnimation = this._betElement.chips.map((chip) =>
            gameResult === GameResult.Lose
                ? chip.animate(ChipAnimation.Lose)
                : chip.animate(ChipAnimation.Win),
        );
        await Promise.all(pendingAnimation);
        this.dispose();
    }

    public reset(): void {
        this._cards.map((card) => card.animate(CardAnimation.Remove, () => card.dispose()));
        this._cards = [];
        this._pointsElement.dispose();
        this._betElement.dispose();
    }

    public update(position: Vector3): void {
        this.position = position;
    }
}
