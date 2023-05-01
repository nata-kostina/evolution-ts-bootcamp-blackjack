import {
    MeshBuilder,
    Texture,
    Vector3,
    StandardMaterial,
    Vector4,
    Mesh,
    TransformNode,
    Scene,
} from "@babylonjs/core";
import { ImgPath } from "../../constants/imgPaths.constants";
import {
    getDealCardAnimation,
    getRemoveCardAnimation,
    getUnholeCardAnimation,
    getTranslateYCardAnimation,
} from "../utils/animation/card.animation";
import { assertUnreachable } from "../../utils/general/assertUnreachable";
import { isNormalCard } from "../../utils/game/isNormalCard";
import { CardAnimation } from "../../types/canvas.types";
import { Card, HoleCard } from "../../types/game.types";
import { animationSpeed, cardSize } from "../../constants/canvas.constants";

export class CardCanvasElement {
    private readonly scene: Scene;
    private readonly _skin: Mesh;
    private readonly _cardObj: Card | HoleCard;
    private _finalPosition: Vector3;
    private texturePath: string;

    public constructor(
        scene: Scene,
        finalPosition: Vector3,
        card: Card | HoleCard,
    ) {
        this.scene = scene;
        this._finalPosition = finalPosition;
        this._cardObj = card;

        const columns = 6;
        const rows = 1;

        const faceUV: Array<Vector4> = [];

        for (let i = 0; i < columns; i++) {
            faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows);
        }

        const options = {
            faceUV,
            wrap: true,
            width: cardSize.width,
            height: cardSize.height,
            depth: cardSize.depth,
        };

        this._skin = MeshBuilder.CreateBox(
      `card-${new Date()}`,
      options,
      scene,
        );
        this._skin.position = new Vector3(4, 4, 4);
        this._skin.rotation.x = -Math.PI * 0.5;

        if (isNormalCard(card)) {
            this.texturePath = ImgPath[`${card.value}${card.suit}`];
        } else {
            this.texturePath = ImgPath.Hole;
        }
    }

    public get cardID(): string {
        return this._cardObj.id;
    }

    public get skin(): Mesh {
        return this._skin;
    }

    public set finalPosition(position: Vector3) {
        this._finalPosition = position;
    }

    public async addContent(): Promise<void> {
        return new Promise<void>((resolve) => {
            const material = new StandardMaterial(
        `material-${this.texturePath}- ${this._cardObj.id}`,
        this.scene,
            );
            const texture = new Texture(this.texturePath, this.scene);
            texture.onLoadObservable.addOnce(() => {
                material.diffuseTexture = texture;
                this._skin.material = material;
                return resolve();
            });
        });
    }

    public async animate(
        type: CardAnimation,
        onFinish?: () => void,
    ): Promise<void> {
        switch (type) {
            case CardAnimation.Deal:
                const { frameRate, animationArray } = getDealCardAnimation(this.position, new Vector3(
                    this._finalPosition.x,
                    this._finalPosition.y + cardSize.height * 0.6,
                    this._finalPosition.z,
                ));
                const dealAnim = this.scene.beginDirectAnimation(
                    this._skin,
                    animationArray,
                    0,
                    frameRate,
                    false,
                    animationSpeed,
                );
                await dealAnim.waitAsync();

                await this.animate(CardAnimation.Unhole);
                if (onFinish) {
                    onFinish();
                }
                break;
            case CardAnimation.Remove:
                const { frameRate: removeFR, animationArray: removeAnimation } =
          getRemoveCardAnimation(this._skin.position);
                const removeAnim = this.scene.beginDirectAnimation(
                    this._skin,
                    removeAnimation,
                    0,
                    removeFR,
                    false,
                    animationSpeed,
                    () => this._skin.dispose(),
                );
                await removeAnim.waitAsync();
                break;
            case CardAnimation.Unhole:
                if (isNormalCard(this._cardObj)) {
                    const { frameRate: FRUnhole, animationArray: unholeAnimation } =
                      getUnholeCardAnimation(this.skin.rotation.z, Math.PI * 0.5);
                    const unholeAnim = this.scene.beginDirectAnimation(
                        this._skin,
                        unholeAnimation,
                        0,
                        FRUnhole,
                        false,
                        animationSpeed,
                    );
                    await unholeAnim.waitAsync();
                }
                const { frameRate: FRtranslate, animationArray: translateAnimation } =
                  getTranslateYCardAnimation(this.position, this._finalPosition);
                const translateAnim = this.scene.beginDirectAnimation(
                    this._skin,
                    translateAnimation,
                    0,
                    FRtranslate,
                    false,
                    animationSpeed,
                );
                await translateAnim.waitAsync();
                break;
            case CardAnimation.OpenDealerCard:
                const { frameRate: framerateTranslate, animationArray: translateDealerCardAnimation } =
                  getTranslateYCardAnimation(this.position, new Vector3(this.position.x,
                      this.position.y + cardSize.height * 0.4,
                      this.position.z));
                const translateDealerCardAnim = this.scene.beginDirectAnimation(
                    this._skin,
                    translateDealerCardAnimation,
                    0,
                    framerateTranslate,
                    false,
                    animationSpeed * 3,
                );
                await translateDealerCardAnim.waitAsync();
                await this.animate(CardAnimation.Unhole);
                break;
            default:
                assertUnreachable(type);
        }
    }

    public set position(position: Vector3) {
        this._skin.position = new Vector3().copyFrom(position);
    }

    public get position(): Vector3 {
        return this._skin.position;
    }

    public dispose(): void {
        this._skin.dispose();
    }

    public setParent(parent: TransformNode): void {
        this._skin.parent = parent;
    }
}
