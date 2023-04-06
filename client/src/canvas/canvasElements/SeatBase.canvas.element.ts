import {
    BackgroundMaterial,
    MeshBuilder,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { Card, Cell, HoleCard } from "../../types/types";
import { ImgPath } from "../../constants/imgPaths.constants";
import { PointsCanvasElement } from "./Points.canvas.element";
import { GameMatrix } from "../GameMatrix";
import { getDealCardAnimation } from "../utils/animation/card.animation";

export class SeatBaseCanvasElement {
    private readonly base: CanvasBase;
    private position: Vector3;
    private cards: Array<Card | HoleCard> = [];
    private points = 0;
    private pointsElement: PointsCanvasElement | null = null;
    private matrix: GameMatrix;

    public constructor(base: CanvasBase, matrix: GameMatrix, type: Cell) {
        this.base = base;
        this.matrix = matrix;

        const mtx = matrix.getMatrix();
        const mtxSize = matrix.getMatrixSize();
        const cellWidth = matrix.getCellWidth();
        const cellHeight = matrix.getCellHeight();
        const matrixWidth = matrix.getMatrixWidth();
        const matrixHeight = matrix.getMatrixHeight();
        const index = mtx.indexOf(type);

        const row = Math.floor(index / mtxSize);
        const column = index % mtxSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            matrixHeight * 0.5 - cellHeight * 0.5 - cellHeight * row,
            0,
        );
    }

    public dealCard(card: Card | HoleCard): void {
        const box = MeshBuilder.CreateGround("box", { width: 0.3, height: 0.5 }, this.base.scene);
        box.rotation.x = -Math.PI * 0.5;
        box.position.z = -this.cards.length * 0.1;

        const boxMaterial = new BackgroundMaterial("material", this.base.scene);
        if (isHoleCard(card)) {
            // this.holeCard
            boxMaterial.diffuseTexture = new Texture(ImgPath.Hole);
            // boxMaterial.diffuseTexture.hasAlpha = true;
        }
        if (isNormalCard(card)) {
            boxMaterial.diffuseTexture = new Texture(ImgPath[`${card.value}${card.suit}`]);
        }
        // boxMaterial.diffuseTexture.hasAlpha = true;
        box.material = boxMaterial;

        const matrixWidth = this.matrix.getMatrixWidth();
        const matrixHeight = this.matrix.getMatrixHeight();
        const { frameRate, animationArray } = getDealCardAnimation(matrixWidth, matrixHeight, this.position, this.cards.length);

        this.base.scene.beginDirectAnimation(box, animationArray, 0, frameRate, false, 3);

        this.cards.push(card);
    }

    public updatePoints(points: number): void {
        if (!this.pointsElement) {
            this.pointsElement = new PointsCanvasElement(this.base, "player-points", this.matrix);
        }
        this.pointsElement.update(points);
    }

    public getBase(): CanvasBase {
        return this.base;
    }

    public getCards(): Array<Card | HoleCard> {
        return this.cards;
    }
}

export function isHoleCard(
    card: Card | HoleCard,
): card is HoleCard {
    return card.id === "hole";
}
export function isNormalCard(
    card: Card | HoleCard,
): card is Card {
    return (card as Card).suit !== undefined;
}
