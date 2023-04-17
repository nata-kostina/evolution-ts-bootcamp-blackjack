/* eslint-disable @typescript-eslint/no-unused-vars */
import { Scene, GroundMesh, MeshBuilder, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { GameMatrix } from "../GameMatrix";
import { HandCanvasElement } from "./Hand.canvas.element";
import { Bet, DealPlayerCard, GameResult } from "../../types/game.types";
import { CardCanvasElement } from "./Card.canvas.element";
import { PointsCanvasElement } from "./Points.canvas.element";
import { CardAnimation, HandAnimation, SplitParams } from "../../types/canvas.types";
import SeatSVG from "../../assets/img/seat/seat.svg";
import { seatSize } from "../../constants/canvas.constants";

export class PlayerSeatCanvasElement extends GroundMesh {
    protected readonly scene: Scene;
    protected matrix: GameMatrix;
    private hands: Array<HandCanvasElement> = [];
    private _activeHand: HandCanvasElement | null = null;
    private readonly _seat: GroundMesh;

    public constructor(scene: Scene, matrix: GameMatrix) {
        super(`player-seat`, scene);
        this.scene = scene;
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
        const position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );

        this._seat = MeshBuilder.CreateGround(
            `player-seat`,
            {
                width: seatSize.width,
                height: seatSize.height,
            },
            this.scene,
        );
        this._seat.setParent(this);
        this.position = position;
        this.rotation.x = -Math.PI * 0.5;
        const groundMaterial = new StandardMaterial(
            `material-player-seat`,
            this.scene,
        );
        groundMaterial.diffuseTexture = new Texture(SeatSVG, this.scene);
        groundMaterial.diffuseTexture.hasAlpha = true;
        this._seat.material = groundMaterial;
    }

    public addHand(handID: string): void {
        const hand = new HandCanvasElement(
            this.scene,
            handID,
            new Vector3().copyFrom(this._seat.position),
        );
        this.hands.push(hand);
    }

    public set activeHand(handID: string) {
        this._activeHand = this.hands.find((hand) => hand.handID === handID) || null;
    }

    public async dealCard(newCard: DealPlayerCard): Promise<void> {
        const hand = this.getHand(newCard.handID) || new HandCanvasElement(
            this.scene,
            newCard.handID,
            this._seat.position,
        );
        this.hands.push(hand);
        await hand.dealCard(newCard);
    }

    public async split({ oldHandID, newHandID, bet, points }: SplitParams): Promise<void> {
        const hand = this.getHand(oldHandID);
        if (hand) {
            this._activeHand = hand;

            const newHand = new HandCanvasElement(
                this.scene,
                newHandID,
                new Vector3().copyFrom(hand.position),
            );

            const [firstCard, secondCard] = hand.cards;
            hand.removeCard(secondCard);
            newHand.addCard(secondCard);
            secondCard.setParent(newHand);
            secondCard.position = new Vector3(0, 0, 0);

            newHand.updatePoints(points);
            hand.updatePoints(points);
            newHand.updateBet(bet);
            this.hands.push(newHand);

            await Promise.all([
                hand.animate(HandAnimation.ToLeft),
                newHand.animate(HandAnimation.ToRight),
            ]);

            await Promise.all(hand.chipsValue.map((chip) => newHand.betElement.addChip(chip)));
        }
    }

    public getHand(handID: string): HandCanvasElement | undefined {
        return this.hands.find((element) => element.handID === handID);
    }

    public async removeHand(handID: string, gameResult: GameResult): Promise<void> {
        const hand = this.getHand(handID);
        if (hand) {
            await hand.remove(gameResult);
            const index = this.hands.findIndex((hand) => hand.handID !== handID);
            if (index) {
                this.hands.slice(index, 1);
            }
        }
    }

    public reset(): void {
        this.hands.forEach((hand) => {
            hand.reset();
            hand.dispose();
        });
    }
}
