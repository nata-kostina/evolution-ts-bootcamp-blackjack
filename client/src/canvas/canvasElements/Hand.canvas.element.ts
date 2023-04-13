/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-redeclare */
import {
    GroundMesh,
    MeshBuilder,
    StandardMaterial,
    Texture,
    TransformNode,
    Vector3,
} from "@babylonjs/core";
import {
    CardAnimation,
    ChipAnimation,
    HandAnimation,
    HelperAnimation,
} from "../../types/canvas.types";
import { Bet, DealPlayerCard, GameResult } from "../../types/game.types";
// import { isNormalCard } from "../../utils/gameUtils/isHoleCard";
import { CanvasBase } from "../CanvasBase";
import { GameMatrix } from "../GameMatrix";
import { CardCanvasElement } from "./Card.canvas.element";
import { getSplitHandAnimation } from "../utils/animation/hand.animation";
import { PointsCanvasElement } from "./Points.canvas.element";
import { BetCanvasElement } from "./Bet.canvas.element";
import { cardSize, handSize } from "../../constants/canvas.constants";
import { HelperCanvasElement } from "./Helper.canvas.element";

export class HandCanvasElement {
    private readonly base: CanvasBase;
    private matrix: GameMatrix;
    private _handID: string;
    private cards: Array<CardCanvasElement> = [];
    private _hand: TransformNode;
    private _pointsElement: PointsCanvasElement | null = null;
    private _betElement: BetCanvasElement;
    private _helper: HelperCanvasElement | null = null;

    public constructor(
        base: CanvasBase,
        matrix: GameMatrix,
        id: string,
        position: Vector3,
    ) {
        this.base = base;
        this.matrix = matrix;
        this._handID = id;

        this._hand = new TransformNode(`node-hand-${id}`);
        this._hand.position = position;

        this._betElement = new BetCanvasElement(
            this.base,
            this._hand.position,
            this._handID,
        );
        this._betElement.setParent(this._hand);
    }

    public get handID(): string {
        return this._handID;
    }

    public async dealCard(newCard: DealPlayerCard): Promise<void> {
        const cardElement = new CardCanvasElement(
            this.base,
            this.matrix,
            new Vector3(
                this._hand.position.x + this.cards.length * 0.13,
                this._hand.position.y,
                this._hand.position.z - this.cards.length * cardSize.depth - 0.04,
            ),
            newCard.card,
        );
        cardElement.setParent(this._hand);
        this.cards.push(cardElement);
        await cardElement.addContent();
        await cardElement.animate(CardAnimation.Deal, () => {
            this.updatePoints(newCard.points);
        });
    }

    public get position(): Vector3 {
        return this._hand.position;
    }

    public get chipsValue(): Array<number> {
        return this._betElement.chips.map((chip) => chip.chip.value);
    }

    public getCards(): Array<CardCanvasElement> {
        return this.cards;
    }

    public addCard(card: CardCanvasElement): void {
        this.cards.push(card);
    }

    public removeCard(card: CardCanvasElement): void {
        this.cards.findIndex((c) => c.cardID === card.cardID);
    }

    public get node(): TransformNode {
        return this._hand;
    }

    public get betElement(): BetCanvasElement {
        return this._betElement;
    }

    public updatePoints(points: number): void {
        if (!this._pointsElement) {
            this._pointsElement = new PointsCanvasElement(
                this.base,
                this._handID,
                this._hand.position,
            );
            this._pointsElement.setParent(this._hand);
        }
        this._pointsElement.update(points);
    }

    public updateBet(bet: Bet): void {
        this._betElement.updateBet(bet);
    }

    public launchHelper(): void {
        if (!this._helper) {
            this._helper = new HelperCanvasElement(this.base, this.node.position);
            this._helper.animate(HelperAnimation.Pulse);
        }
    }

    public async animate(
        type: HandAnimation,
        onFinish?: () => void,
    ): Promise<void> {
        const matrixWidth = this.matrix.getMatrixWidth();
        const matrixHeight = this.matrix.getMatrixHeight();
        if (type === HandAnimation.ToLeft || type === HandAnimation.ToRight) {
            const { frameRate, animationArray } = getSplitHandAnimation(
                matrixWidth,
                matrixHeight,
                type,
                this.position,
            );
            this.base.scene.beginDirectAnimation(
                this._hand,
                animationArray,
                0,
                frameRate,
                false,
                2,
        () => {
            if (onFinish) {
                onFinish();
            }
        },
            );
        }
    }

    public async remove(gameResult: GameResult): Promise<void> {
        const pendingCardsAnimation = this.cards.map((card) => card.animate(CardAnimation.Remove));
        await Promise.all(pendingCardsAnimation);
        const pendingAnimation = this._betElement.chips.map((chip) =>
            gameResult === GameResult.Lose
                ? chip.animate(ChipAnimation.Lose)
                : chip.animate(ChipAnimation.Win),
        );
        await Promise.all(pendingAnimation);
        this._hand.dispose();
    }
}
