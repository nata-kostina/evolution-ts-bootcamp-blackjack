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
import CardImg from "../../assets/img/cards/4C.png";
import { ImgPath } from "../../constants/imgPaths.constants";
import { PointsCanvasElement } from "./Points.canvas.element";
import { GameMatrix } from "../GameMatrix";
import { SeatBaseCanvasElement } from "./SeatBase.canvas.element";

export class PlayerSeatCanvasElement extends SeatBaseCanvasElement {
    public constructor(base: CanvasBase, matrix: GameMatrix) {
        super(base, matrix, "player-seat");
    }
}
