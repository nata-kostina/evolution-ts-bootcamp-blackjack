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
import ChipImg from "../../assets/img/chips/chip_5.png";
import { CardCanvasElement } from "./Card.canvas.element";
import { Card } from "../../types/types";
import { SceneMatrix, matrixSize, matrixWidth, cellSize, matrixHeight } from "../GameMatrix";
import CardImg from "../../assets/img/cards/4C.png";
import { ImgPath } from "../../constants/imgPaths.constants";
import { PointsCanvasElement } from "./Points.canvas.element";

export class PlayerSeatCanvasElement {
    private readonly base: CanvasBase;
    private position: Vector3;
    private cards: Card[] = [];
    private points = 0;
    private pointsElement: PointsCanvasElement | null = null;

    public constructor(base: CanvasBase) {
        this.base = base;
        const index = SceneMatrix.indexOf("player-seat");

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

    public dealCard(card: Card): void {
        const box = MeshBuilder.CreateGround("box", { width: 0.3, height: 0.5 }, this.base.scene);
        box.rotation.x = -Math.PI * 0.5;
        box.position.z = -this.cards.length * 0.1;

        const boxMaterial = new BackgroundMaterial("material", this.base.scene);
        boxMaterial.diffuseTexture = new Texture(ImgPath[`${card.value}${card.suit}`]);
        boxMaterial.diffuseTexture.hasAlpha = true;
        box.material = boxMaterial;

        const frameRate = 8;
        // //Position Animation
        const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

        const keyFramesX = [];

        const endX = this.position.x + this.cards.length * 0.13;

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
            this.pointsElement = new PointsCanvasElement(this.base, "player-points");
        }
        this.pointsElement.update(points);
    }
}
