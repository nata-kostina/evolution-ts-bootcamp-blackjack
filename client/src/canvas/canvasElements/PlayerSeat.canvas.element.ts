import {
    Scene,
    GroundMesh,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { CanvasElement, GameMatrix } from "../GameMatrix";
import { HandCanvasElement } from "./Hand.canvas.element";
import {
    DealPlayerCard,
    GameResult,
    PlayerID,
    PlayerInstance,
} from "../../types/game.types";
import { HandAnimation, SplitParams } from "../../types/canvas.types";
import { seatSize } from "../../constants/canvas.constants";
import { assetsSrc } from "../../constants/assets.constants";
import { getPositionFromMatrix } from "../utils/getPositionFromMatrix";

export class PlayerSeatCanvasElement
    extends GroundMesh
    implements CanvasElement {
    protected readonly scene: Scene;
    protected readonly _playerID: PlayerID;
    private hands: Array<HandCanvasElement> = [];
    private _activeHand: HandCanvasElement | null = null;
    private readonly _seat: GroundMesh;

    public constructor(scene: Scene, position: Vector3, playerID: PlayerID) {
        super(`player-seat`, scene);
        this.scene = scene;
        this._playerID = playerID;
        this._seat = MeshBuilder.CreateGround(
      `player-seat`,
      {
          width: seatSize.width,
          height: seatSize.height,
      },
      this.scene,
        );
        this._seat.setParent(this);
        // this.position = getPositionFromMatrix(matrix, "player-seat");
        this.position = position;
        this.rotation.x = -Math.PI * 0.5;
    }

    public get playerID(): PlayerID {
        return this._playerID;
    }

    public addContent(): void {
        const groundMaterial = new StandardMaterial(
      `material-player-seat`,
      this.scene,
        );
        const seatTexture = this.scene.getTextureByName(assetsSrc.seat) as Texture;
        groundMaterial.diffuseTexture = seatTexture;
        groundMaterial.diffuseTexture.hasAlpha = true;
        this._seat.material = groundMaterial;
    }

    public addHand(handID: string): HandCanvasElement {
        const hand = new HandCanvasElement(
            this.scene,
            handID,
            new Vector3().copyFrom(this.position),
        );
        this.hands.push(hand);
        return hand;
    }

    public updateSeat(player: PlayerInstance): void {
        console.log("player. hands: ", { player: player?.playerID, handsNum: player?.hands?.length });
        if (this.hands) {
            this.hands.forEach((hand) => {
                const updatedHand = player.hands.find((_h) => _h.handID === hand.handID);
                if (updatedHand) {
                    hand.updateHand(updatedHand);
                }
            });
        }
    }

    public set activeHand(handID: string) {
        this._activeHand =
      this.hands.find((hand) => hand.handID === handID) || null;
    }

    public async dealCard(newCard: DealPlayerCard): Promise<void> {
        const hand =
      this.getHand(newCard.handID) ||
      new HandCanvasElement(this.scene, newCard.handID, this._seat.position);
        this.hands.push(hand);
        await hand.dealCard(newCard);
    }

    public async split({
        oldHandID,
        newHandID,
        bet,
        points,
    }: SplitParams): Promise<void> {
        const hand = this.getHand(oldHandID);
        if (hand) {
            this._activeHand = hand;

            const newHand = new HandCanvasElement(
                this.scene,
                newHandID,
                new Vector3().copyFrom(hand.position),
            );
            newHand.pointsElement.skin.isVisible = true;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [firstCard, secondCard] = hand.cards;
            hand.removeCard(secondCard);
            newHand.addCard(secondCard);
            secondCard.setParent(newHand);
            secondCard.position = new Vector3(0, 0, 0);

            newHand.updatePoints(points);
            hand.updatePoints(points);
            newHand.updateBet(bet);
            this.hands.push(newHand);

            await Promise.all([
                hand.animate(HandAnimation.ToLeft),
                newHand.animate(HandAnimation.ToRight),
            ]);

            await Promise.all(
                hand.chipsValue.map((chip) => newHand.betElement.addChip(chip)),
            );
        }
    }

    public getHand(handID: string): HandCanvasElement | undefined {
        return this.hands.find((element) => element.handID === handID);
    }

    public async removeHand(
        handID: string,
        gameResult: GameResult,
    ): Promise<void> {
        const hand = this.getHand(handID);
        if (hand) {
            await hand.remove(gameResult);
            const index = this.hands.findIndex((_hand) => _hand.handID !== handID);
            if (index) {
                this.hands.slice(index, 1);
            }
        }
    }

    public reset(): void {
        this.hands.forEach((hand) => {
            hand.reset();
            hand.dispose();
        });
        this.hands = [];
        // console.log("seat reset this.hands: ", this.hands);
    }

    public update(matrix: GameMatrix): void {
        this.position = getPositionFromMatrix(matrix, "player-seat");
    }
}
