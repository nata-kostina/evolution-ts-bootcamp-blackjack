/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    MeshBuilder,
    Texture,
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
import { assertUnreachable } from "../../utils/assertUnreachable";
import { GameMatrix } from "../GameMatrix";
import { isHoleCard } from "../../utils/gameUtils/isHoleCard";
import { CardAnimation } from "../../types/canvas.types";
import { Card, HoleCard } from "../../types/game.types";

export class CardCanvasElement {
    private readonly base: CanvasBase;
    private readonly skin: Mesh;
    private readonly matrix: GameMatrix;
    private finalPosition: Vector3;
    private isHoleCard: boolean;
    private texturePath: string;

    public constructor(
        base: CanvasBase,
        matrix: GameMatrix,
        position: Vector3,
        card: Card | HoleCard,
    ) {
        this.base = base;
        this.matrix = matrix;
        this.finalPosition = position;
        this.isHoleCard = isHoleCard(card);

        const columns = 6;
        const rows = 1;

        const faceUV: Array<Vector4> = [];

        for (let i = 0; i < 6; i++) {
            faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
        }

        const options = {
            faceUV,
            wrap: true,
            width: 0.3,
            height: 0.5,
            depth: 0.001,
        };

        this.skin = MeshBuilder.CreateBox(
      `card-${new Date()}`,
      options,
      this.base.scene,
        );
        this.skin.position = new Vector3(-10, -10, position.z);
        this.skin.rotation.y = Math.PI;
        this.texturePath = this.isHoleCard
            ? ImgPath.Hole
            : ImgPath[`${(card as Card).value}${(card as Card).suit}`];
    }

    public async addContent(): Promise<void> {
        return new Promise<void>((resolve) => {
            const material = new StandardMaterial(
                `material-${this.texturePath}- ${Date.now()}`,
                this.base.scene,
            );
            const texture = new Texture(this.texturePath, this.base.scene);
            texture.onLoadObservable.addOnce(() => {
                material.diffuseTexture = texture;
                this.skin.material = material;
                return resolve();
            });
        });
    }

    public async animate(type: CardAnimation, onFinish?: () => void): Promise<void> {
        const matrixWidth = this.matrix.getMatrixWidth();
        const matrixHeight = this.matrix.getMatrixHeight();
        switch (type) {
            case CardAnimation.Deal:
                const { frameRate, animationArray } = getDealCardAnimation(
                    matrixWidth,
                    matrixHeight,
                    this.finalPosition,
                );
                this.base.scene.beginDirectAnimation(
                    this.skin,
                    animationArray,
                    0,
                    frameRate,
                    false,
                    3,
          () => {
              if (!this.isHoleCard) {
                  this.animate(CardAnimation.Unhole, onFinish);
              } else if (onFinish) {
                  onFinish();
              }
          },
                );
                break;
            case CardAnimation.Remove:
                const { frameRate: removeFR, animationArray: removeAnim } =
          getRemoveCardAnimation(matrixWidth, matrixHeight, this.finalPosition);
                this.base.scene.beginDirectAnimation(
                    this.skin,
                    removeAnim,
                    0,
                    removeFR,
                    false,
                    3,
          () => this.skin.dispose(),
                );
                break;
            case CardAnimation.Unhole:
                const { frameRate: FRUnhole, animationArray: unholeAnimation } =
          getUnholeCardAnimation();
                this.base.scene.beginDirectAnimation(
                    this.skin,
                    unholeAnimation,
                    0,
                    FRUnhole,
                    false,
                    5,
          () => {
              if (onFinish) {
                  onFinish();
              }
          },
                );
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

    private async boot(): Promise<void> {
    }
}
