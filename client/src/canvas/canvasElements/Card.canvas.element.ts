/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    BackgroundMaterial,
    MeshBuilder,
    Texture,
    GroundMesh,
    Vector3,
    StandardMaterial,
    Vector4,
    Mesh,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { ImgPath } from "../../constants/imgPaths.constants";
import {
    getDealCardAnimation,
    getRemoveCardAnimation,
    getUnholeCardAnimation,
} from "../utils/animation/card.animation";
import { Card, CardAnimation, HoleCard } from "../../types/types";
import { assertUnreachable } from "../../utils/assertUnreachable";
import { GameMatrix } from "../GameMatrix";
import { isHoleCard, isNormalCard } from "../../utils/gameUtils/isHoleCard";

export class CardCanvasElement {
    private readonly base: CanvasBase;
    private readonly skin: Mesh;
    private readonly matrix: GameMatrix;
    private finalPosition: Vector3;
    private isHoleCard: boolean;
    public constructor(base: CanvasBase, matrix: GameMatrix, position: Vector3, card: Card | HoleCard) {
        this.base = base;
        this.matrix = matrix;

        if (isHoleCard(card)) {
            this.isHoleCard = true;
        } else {
            this.isHoleCard = false;
        }

        const mat = new StandardMaterial("mat", this.base.scene);
        const texture = new Texture(isHoleCard(card) ? ImgPath.Hole :
            ImgPath[`${(card as Card).value}${(card as Card).suit}`], this.base.scene);
        mat.diffuseTexture = texture;

        const columns = 6;
        const rows = 1;

        const faceUV: Array<Vector4> = [];

        for (let i = 0; i < 6; i++) {
            faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
        }

        // if (this.isHoleCard) {
        //     const temp: Vector4 = faceUV[0];
        //     faceUV[0] = faceUV[1];
        //     faceUV[1] = temp;
        // }
        const options = {
            faceUV,
            wrap: true,
            width: 0.3,
            height: 0.5,
            depth: 0.001,
        };

        this.skin = MeshBuilder.CreateBox(`card-${new Date()}`, options, this.base.scene);
        this.skin.material = mat;
        this.finalPosition = position;
        this.skin.position = new Vector3(-10, -10, position.z);
        // if (!this.isHoleCard) {
        this.skin.rotation.y = Math.PI;
        // }

        // this.skin = MeshBuilder.CreateGround(`card-${new Date()}`, { width: 0.3, height: 0.5 }, this.base.scene);
        // this.skin.rotation.x = -Math.PI * 0.5;
        // this.skin = MeshBuilder.CreateBox(`card-${new Date()}`, options, scene);
        // box.material = mat;

        // this.skin.position = position;

        // const cardMaterial = new BackgroundMaterial("material", this.base.scene);
        // if (isHoleCard(card)) {
        //     // this.holeCard
        //     cardMaterial.diffuseTexture = new Texture(ImgPath.Hole);
        //     // boxMaterial.diffuseTexture.hasAlpha = true;
        // }
        // if (isNormalCard(card)) {
        //     cardMaterial.diffuseTexture = new Texture(ImgPath[`${card.value}${card.suit}`]);
        // }
        // // boxMaterial.diffuseTexture.hasAlpha = true;
        // this.skin.material = cardMaterial;
    }

    public animate(type: CardAnimation): void {
        const matrixWidth = this.matrix.getMatrixWidth();
        const matrixHeight = this.matrix.getMatrixHeight();
        switch (type) {
            case CardAnimation.Deal:
                const { frameRate, animationArray } = getDealCardAnimation(matrixWidth, matrixHeight, this.finalPosition);
                this.base.scene.beginDirectAnimation(this.skin, animationArray, 0, frameRate, false, 3, () => {
                    if (!this.isHoleCard) {
                        this.animate(CardAnimation.Unhole);
                    }
                });
                break;
            case CardAnimation.Remove:
                const {
                    frameRate: removeFR,
                    animationArray: removeAnim,
                } = getRemoveCardAnimation(matrixWidth, matrixHeight, this.finalPosition);
                this.base.scene.beginDirectAnimation(this.skin, removeAnim, 0, removeFR, false, 3, () => this.skin.dispose());
                break;
            case CardAnimation.Unhole:
                const { frameRate: FRUnhole, animationArray: unholeAnimation } = getUnholeCardAnimation();
                this.base.scene.beginDirectAnimation(this.skin, unholeAnimation, 0, FRUnhole, false, 5);
                break;
            default:
                assertUnreachable(type);
        }
    }

    public getPosition(): Vector3 {
        return this.skin.position;
    }

    public dispose(): void {
        this.skin.dispose();
    }

    public setMeshPosition(position: Vector3): void {
        this.skin.position = position;
    }
}
