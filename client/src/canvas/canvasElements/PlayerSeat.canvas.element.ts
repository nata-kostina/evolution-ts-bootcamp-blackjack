/* eslint-disable @typescript-eslint/no-unused-vars */
import { GroundMesh, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { GameMatrix } from "../GameMatrix";
import { HandCanvasElement } from "./Hand.canvas.element";
import { Bet, DealPlayerCard, GameResult } from "../../types/game.types";
import { CardCanvasElement } from "./Card.canvas.element";
import { PointsCanvasElement } from "./Points.canvas.element";
import { HandAnimation, SplitParams } from "../../types/canvas.types";
import SeatSVG from "../../assets/img/seat/seat.svg";
import { seatSize } from "../../constants/canvas.constants";

export class PlayerSeatCanvasElement {
    protected readonly base: CanvasBase;
    protected matrix: GameMatrix;
    protected position: Vector3;
    private hands: Array<HandCanvasElement> = [];
    private _activeHand: HandCanvasElement | null = null;
    private _ground: GroundMesh;
    private cards: Array<CardCanvasElement> = [];
    private pointsElement: PointsCanvasElement | null = null;

    public constructor(base: CanvasBase, matrix: GameMatrix) {
        this.base = base;
        this.matrix = matrix;

        const mtx = matrix.getMatrix();
        const mtxSize = matrix.getMatrixSize();
        const cellWidth = matrix.getCellWidth();
        const cellHeight = matrix.getCellHeight();
        const matrixWidth = matrix.getMatrixWidth();
        const matrixHeight = matrix.getMatrixHeight();
        const index = mtx.indexOf("player-seat");

        const row = Math.floor(index / mtxSize);
        const column = index % mtxSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            -0.1,
        );

        this._ground = MeshBuilder.CreateGround(
            `player-seat`,
            {
                width: seatSize.width,
                height: seatSize.height,
            },
            this.base.scene,
        );

        const groundMaterial = new StandardMaterial(
            `material-player-seat`,
            this.base.scene,
        );
        groundMaterial.diffuseTexture = new Texture(SeatSVG, this.base.scene);
        groundMaterial.diffuseTexture.hasAlpha = true;
        this._ground.material = groundMaterial;
        this._ground.rotation.x = -Math.PI * 0.5;
    }

    public addHand(handID: string): void {
        const hand = new HandCanvasElement(
            this.base,
            this.matrix,
            handID,
            this.position,
        );
        this.hands.push(hand);
    }

    public set activeHand(handID: string) {
        this._activeHand = this.hands.find((hand) => hand.handID === handID) || null;
    }

    public async highlightActiveHand(): Promise<void> {
        if (this._activeHand) {
            await this._activeHand.animate(HandAnimation.Highlight);
        }
    }

    public async dealCard(newCard: DealPlayerCard): Promise<void> {
        const hand = this.getHand(newCard.handID) || new HandCanvasElement(
            this.base,
            this.matrix,
            newCard.handID,
            this.position,
        );
        this.hands.push(hand);
        await hand.dealCard(newCard);
    }

    public async split({ oldHandID, newHandID, bet, points }: SplitParams): Promise<void> {
        const hand = this.getHand(oldHandID);
        if (hand) {
            this._activeHand = hand;

            const newHand = new HandCanvasElement(
                this.base,
                this.matrix,
                newHandID,
                new Vector3().copyFrom(hand.position),
            );

            const [firstCard, secondCard] = hand.getCards();
            hand.removeCard(secondCard);
            newHand.addCard(secondCard);
            secondCard.setParent(newHand.node);
            secondCard.position = new Vector3(0, 0, 0);

            newHand.updatePoints(points);
            hand.updatePoints(points);
            newHand.updateBet(bet);

            await Promise.all([
                hand.animate(HandAnimation.ToLeft, () => {
                    hand.launchHelper();
                }),
                newHand.animate(HandAnimation.ToRight, () => {
                    hand.chipsValue.forEach((chip) => {
                        newHand.betElement.addChip(chip);
                    });
                }),
            ]);
        }
    }

    public getHand(handID: string): HandCanvasElement | undefined {
        return this.hands.find((element) => element.handID === handID);
    }

    public async highllightActiveHand(handID: string): Promise<void> {
        const activeHand = this.getHand(handID);
        if (activeHand) {
            await activeHand.animate(HandAnimation.Highlight);
        }
    }

    public async removeHand(handID: string, gameResult: GameResult): Promise<void> {
        const hand = this.getHand(handID);
        if (hand) {
            await hand.remove(gameResult);
        }
    }
}
