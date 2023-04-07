/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BackgroundMaterial, MeshBuilder, Texture, GroundMesh, Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { ImgPath } from "../../constants/imgPaths.constants";
import { getDealCardAnimation, getRemoveCardAnimation } from "../utils/animation/card.animation";
import { Card, CardAnimation, HoleCard } from "../../types/types";
import { assertUnreachable } from "../../utils/assertUnreachable";
import { GameMatrix } from "../GameMatrix";
import { isHoleCard, isNormalCard } from "../../utils/gameUtils/isHoleCard";

export class CardCanvasElement {
    private readonly base: CanvasBase;
    private readonly skin: GroundMesh;
    private readonly matrix: GameMatrix;

    public constructor(base: CanvasBase, matrix: GameMatrix, position: Vector3, card: Card | HoleCard) {
        this.base = base;
        this.matrix = matrix;
        this.skin = MeshBuilder.CreateGround("box", { width: 0.3, height: 0.5 }, this.base.scene);
        this.skin.rotation.x = -Math.PI * 0.5;
        this.skin.position = position;

        const cardMaterial = new BackgroundMaterial("material", this.base.scene);
        if (isHoleCard(card)) {
            // this.holeCard
            cardMaterial.diffuseTexture = new Texture(ImgPath.Hole);
            // boxMaterial.diffuseTexture.hasAlpha = true;
        }
        if (isNormalCard(card)) {
            cardMaterial.diffuseTexture = new Texture(ImgPath[`${card.value}${card.suit}`]);
        }
        // boxMaterial.diffuseTexture.hasAlpha = true;
        this.skin.material = cardMaterial;

        const matrixWidth = this.matrix.getMatrixWidth();
        const matrixHeight = this.matrix.getMatrixHeight();
    }

    public animate(type: CardAnimation): void {
        const matrixWidth = this.matrix.getMatrixWidth();
        const matrixHeight = this.matrix.getMatrixHeight();
        switch (type) {
            case CardAnimation.Deal:
                const { frameRate, animationArray } = getDealCardAnimation(matrixWidth, matrixHeight, this.skin.position);
                this.base.scene.beginDirectAnimation(this.skin, animationArray, 0, frameRate, false, 3);
                break;
            case CardAnimation.Remove:
                const {
                    frameRate: removeFR,
                    animationArray: removeAnim,
                } = getRemoveCardAnimation(matrixWidth, matrixHeight, this.skin.position);
                this.base.scene.beginDirectAnimation(this.skin, removeAnim, 0, removeFR, false, 3, () => this.skin.dispose());
                break;
            default:
                assertUnreachable(type);
        }
    }
}
