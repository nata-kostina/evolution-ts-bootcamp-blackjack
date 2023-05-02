import {
    Axis,
    Scene,
    Space,
    StandardMaterial,
    Texture,
    TransformNode,
    Vector3,
} from "@babylonjs/core";
import { assetsSrc } from "../../constants/assets.constants";
import { cardSize } from "../../constants/canvas.constants";
import { CanvasElement, GameMatrix } from "../GameMatrix";
import { getPositionFromMatrix } from "../utils/getPositionFromMatrix";
import { CardCanvasElement } from "./Card.canvas.element";

export class DeckCanvasElement extends TransformNode implements CanvasElement {
    private readonly scene: Scene;
    private readonly cardsNum = 100;

    public constructor(
        scene: Scene,
        matrix: GameMatrix,
    ) {
        super(`deck`, scene);
        this.scene = scene;

        this.position = getPositionFromMatrix(matrix, "deck");
        this.rotation.x = Math.PI * 0.5;
        this.rotate(Axis.Y, Math.PI / 9, Space.LOCAL);
    }

    public addContent(): void {
        const cardMaterial = new StandardMaterial(
            `material-deck-card`,
            this.scene,
        );
        const cardTexture = this.scene.getTextureByName(assetsSrc.holeCard) as Texture;
        cardMaterial.diffuseTexture = cardTexture;
        cardMaterial.diffuseTexture.hasAlpha = true;

        for (let i = 0; i < this.cardsNum; i++) {
            const card = new CardCanvasElement(this.scene, new Vector3(0, 0, 0), { id: `deck-card-${i}` });
            card.skin.parent = this;
            card.position = new Vector3(0, -i * cardSize.depth, 0);
            card.skin.material = cardMaterial;
        }
    }

    public update(matrix: GameMatrix): void {
        this.position = getPositionFromMatrix(matrix, "deck");
    }
}
