/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    ActionManager,
    Animation,
    BackgroundMaterial,
    Color3,
    DynamicTexture,
    ExecuteCodeAction,
    InterpolateValueAction,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { Card, HoleCard } from "../../types/types";
import { SceneMatrix, matrixSize, matrixWidth, cellSize, matrixHeight } from "../GameMatrix";
import { ImgPath } from "../../constants/imgPaths.constants";
import { PointsCanvasElement } from "./Points.canvas.element";

export class DealerSeatCanvasElement {
    private readonly base: CanvasBase;
    private position: Vector3;
    private cards: (Card | HoleCard)[] = [];
    private holeCard: HoleCard | null = null;
    private pointsElement: PointsCanvasElement | null = null;
    public constructor(base: CanvasBase) {
        this.base = base;
        const index = SceneMatrix.indexOf("dealer-seat");

        const row = Math.floor(index / matrixSize);
        const column = index % matrixSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellSize * 0.5 + cellSize * column,
            matrixHeight * 0.5 - cellSize * 0.5 - cellSize * row,
            0,
        );

        // this.addContent();
    }

    // public addContent(): void {

    // }

    public dealCard(card: Card | HoleCard): void {
        console.log("dealer seat dealCard");
        const box = MeshBuilder.CreateGround("box", { width: 0.3, height: 0.5 }, this.base.scene);
        box.rotation.x = -Math.PI * 0.5;
        box.position.z = -this.cards.length * 0.1;

        const boxMaterial = new BackgroundMaterial("material", this.base.scene);
        if (isHoleCard(card)) {
            // this.holeCard
            boxMaterial.diffuseTexture = new Texture(ImgPath.Hole);
            boxMaterial.diffuseTexture.hasAlpha = true;
        }
        if (isNormalCard(card)) {
            boxMaterial.diffuseTexture = new Texture(ImgPath[`${card.value}${card.suit}`]);
            boxMaterial.diffuseTexture.hasAlpha = true;
        }
        box.material = boxMaterial;

        const frameRate = 8;
        // //Position Animation
        const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

        const keyFramesX = [];

        const endX = this.cards.length * 0.1;

        keyFramesX.push({
            frame: 0,
            value: 1,
        });

        keyFramesX.push({
            frame: frameRate,
            value: endX,
        });

        xSlide.setKeys(keyFramesX);

        const ySlide = new Animation("ySlide", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT);

        const keyFramesY = [];

        keyFramesY.push({
            frame: 0,
            value: 1,
        });

        keyFramesY.push({
            frame: frameRate,
            value: this.position.y,
        });

        ySlide.setKeys(keyFramesY);

        this.base.scene.beginDirectAnimation(box, [xSlide, ySlide], 0, frameRate, false, 3);

        this.cards.push(card);
    }

    public updatePoints(points: number): void {
        if (!this.pointsElement) {
            this.pointsElement = new PointsCanvasElement(this.base, "dealer-points");
        }
        this.pointsElement.update(points);
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
