/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    ActionManager,
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
import { AdvancedDynamicTexture, Button, TextBlock } from "@babylonjs/gui/2D";
import { CanvasBase } from "../CanvasBase";
import { SceneMatrix, matrixSize, matrixWidth, cellSize, matrixHeight, Cell } from "../GameMatrix";

export class PointsCanvasElement {
    private id: Cell;
    private position: Vector3;
    private readonly base: CanvasBase;
    private textBlock: TextBlock;

    public constructor(base: CanvasBase, id: Cell) {
        console.log("Points constructor");
        this.base = base;
        this.id = id;

        const index = SceneMatrix.indexOf(this.id);

        const row = Math.floor(index / matrixSize);
        const column = index % matrixSize;
        this.position = new Vector3(
            -matrixWidth * 0.5 + cellSize * 0.5 + cellSize * column,
            matrixHeight * 0.5 - cellSize * 0.5 - cellSize * row,
            0,
        );

        const points = MeshBuilder.CreateGround(`points-${this.id}`, { width: 0.5, height: 0.2 }, this.base.scene);
        // points.scaling = new Vector3(0.2, 0.2, 0.2);
        points.position.x = this.position.x;
        points.position.y = this.position.y;
        points.rotation.x = -Math.PI * 0.5;

        const texture = AdvancedDynamicTexture.CreateForMesh(points);
        texture.background = "#17515E";
        this.textBlock = new TextBlock(`text-points-${this.id}`, "0");
        this.textBlock.color = "white";
        this.textBlock.fontSize = 350;

        texture.addControl(this.textBlock);
    }

    public addContent(): void {
        // console.log("CardCanvasElement addContent");
        // const points = MeshBuilder.CreateGround(`points-${this.id}`, { width: 0.2, height: 0.15 }, this.base.scene);
        // points.position.x = this.position.x;
        // points.position.y = this.position.y;

        // const advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(points);
        // advancedTexture.background = "green";
    }

    public update(points: number): void {
        this.textBlock.text = points.toString();
    }
}
