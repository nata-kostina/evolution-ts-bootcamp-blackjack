/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    MeshBuilder,
    Texture,
    Vector3,
    StandardMaterial,
    Vector4,
    Mesh,
    TransformNode,
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
import { cardSize } from "../../constants/canvas.constants";

export class CardCanvasElement {
    private readonly base: CanvasBase;
    private readonly skin: Mesh;
    private readonly matrix: GameMatrix;
    private finalPosition: Vector3;
    private isHoleCard: boolean;
    private texturePath: string;
    private readonly _cardObj: Card | HoleCard;

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
        this._cardObj = card;
        const columns = 6;
        const rows = 1;

        const faceUV: Array<Vector4> = [];

        for (let i = 0; i < 6; i++) {
            faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
        }

        const options = {
            faceUV,
            wrap: true,
            width: cardSize.width,
            height: cardSize.height,
            depth: cardSize.depth,
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

    public get cardID(): string {
        return this._cardObj.id;
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

    public async animate(
        type: CardAnimation,
        onFinish?: () => void,
    ): Promise<void> {
        const matrixWidth = this.matrix.getMatrixWidth();
        const matrixHeight = this.matrix.getMatrixHeight();
        switch (type) {
            case CardAnimation.Deal:
                const { frameRate, animationArray } = getDealCardAnimation(
                    matrixWidth,
                    matrixHeight,
                    this.finalPosition,
                );
                const dealAnim = this.base.scene.beginDirectAnimation(
                    this.skin,
                    animationArray,
                    0,
                    frameRate,
                    false,
                    3,
                );
                await dealAnim.waitAsync();
                if (!this.isHoleCard) {
                    await this.animate(CardAnimation.Unhole, onFinish);
                } else if (onFinish) {
                    onFinish();
                }
                break;
            case CardAnimation.Remove:
                const { frameRate: removeFR, animationArray: removeAnimation } =
          getRemoveCardAnimation(matrixWidth, matrixHeight, this.finalPosition);
                const removeAnim = this.base.scene.beginDirectAnimation(
                    this.skin,
                    removeAnimation,
                    0,
                    removeFR,
                    false,
                    3,
                    () => this.skin.dispose(),
                );
                await removeAnim.waitAsync();
                break;
            case CardAnimation.Unhole:
                const { frameRate: FRUnhole, animationArray: unholeAnimation } =
          getUnholeCardAnimation();
                const unholeAnim = this.base.scene.beginDirectAnimation(
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
                await unholeAnim.waitAsync();
                break;
            default:
                assertUnreachable(type);
        }
    }

    public set position(position: Vector3) {
        this.skin.position = new Vector3().copyFrom(position);
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

    public setParent(parent: TransformNode): void {
        this.skin.parent = parent;
    }

    private async boot(): Promise<void> {}
}
