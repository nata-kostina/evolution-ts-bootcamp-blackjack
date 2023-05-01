import {
    Scene,
    GroundMesh,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Vector3,
    Axis,
    Space,
    ActionManager,
} from "@babylonjs/core";
import { HandCanvasElement } from "./Hand.canvas.element";
import {
    DealPlayerCard,
    GameResult,
    PlayerID,
    PlayerInstance,
    Seat,
} from "../../types/game.types";
import { HandAnimation, SplitParams } from "../../types/canvas.types";
import { seatSize } from "../../constants/canvas.constants";
import { assetsSrc } from "../../constants/assets.constants";

export class PlayerSeatCanvasElement
    extends GroundMesh {
    private readonly scene: Scene;
    private readonly _type: Seat;
    private _playerID: PlayerID | null = null;
    private _hands: Array<HandCanvasElement> = [];
    private readonly _seat: GroundMesh;

    public constructor(
        scene: Scene,
        type: Seat,
        position: Vector3,
        rotation: number,
    ) {
        super(`player-seat`, scene);
        this.scene = scene;
        this._type = type;
        this._seat = MeshBuilder.CreateGround(
      `player-seat-${type}`,
      {
          width: seatSize.width,
          height: seatSize.height,
      },
      this.scene,
        );

        this._seat.setParent(this);

        this.rotate(Axis.X, -Math.PI * 0.5, Space.LOCAL);
        this.rotate(Axis.Y, rotation, Space.LOCAL);
        this.position = position;

        this._seat.actionManager = new ActionManager(this.scene);
    }

    public set playerID(value: PlayerID | null) {
        this._playerID = value;
    }

    public get playerID(): PlayerID | null {
        return this._playerID;
    }

    public get type(): Seat {
        return this._type;
    }

    public get seat(): GroundMesh {
        return this._seat;
    }

    public get hands(): Array<HandCanvasElement> {
        return this._hands;
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
        );
        hand.parent = this;
        this._hands.push(hand);
        return hand;
    }

    public async dealCard(newCard: DealPlayerCard): Promise<void> {
        const hand = this.getHand(newCard.handID);
        if (hand) {
            hand.parent = this;
            await hand.dealCard(newCard);
        }
    }

    public async split({
        oldHandID,
        newHandID,
        bet,
        points,
    }: SplitParams): Promise<void> {
        const hand = this.getHand(oldHandID);
        if (hand) {
            const newHand = new HandCanvasElement(
                this.scene,
                newHandID,
            );
            newHand.parent = this;
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
            this._hands.push(newHand);

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
        return this._hands.find((element) => element.handID === handID);
    }

    public async removeHand(
        handID: string,
        gameResult: GameResult,
    ): Promise<void> {
        const hand = this.getHand(handID);
        if (hand) {
            await hand.remove(gameResult);
            const index = this._hands.findIndex((_hand) => _hand.handID === handID);
            if (index > -1) {
                this._hands.splice(index, 1);
            }
        }
    }

    public reset(): void {
        this._hands.forEach((hand) => {
            hand.reset();
            hand.dispose();
        });
        this._hands = [];
    }

    public updateData(data: PlayerInstance): void {
        this.playerID = data.playerID;
        const dataHandsIds = data.hands.map((_hand) => _hand.handID);
        const existingHandsIDs = this._hands.map((_hand) => _hand.handID);
        const newHands = dataHandsIds.filter(
            (id) => !existingHandsIDs.includes(id),
        );
        const toDeleteHandsElements = this._hands.filter(
            (_hand) => !dataHandsIds.includes(_hand.handID),
        );
        const toUpdateHandsElements = this._hands.filter((_hand) =>
            dataHandsIds.includes(_hand.handID),
        );

        toDeleteHandsElements.forEach((_hand) => {
            _hand.dispose();
            const handIdx = this._hands.findIndex(
        (hand) => hand.handID === _hand.handID,
            );
            if (handIdx > -1) {
                this._hands.slice(handIdx, 1);
            }
        });

        newHands.forEach((id) => {
            const newHand = new HandCanvasElement(
                this.scene,
                id,
            );
            newHand.parent = this;
            this._hands.push(newHand);

            const hand = data.hands.find((_hand) => _hand.handID === id);
            if (hand) {
                hand.cards.map((card) =>
          newHand.addCard2({
              card,
              handID: newHand.handID,
              playerID: data.playerID,
              points: hand.points,
              target: "player",
          }),
                );
            }
        });

        toUpdateHandsElements.forEach((_handElement) => {
            const hand = data.hands.find(
        (_hand) => _hand.handID === _handElement.handID,
            );
            if (hand) {
                _handElement.updateBet(hand.bet);
                _handElement.updatePoints(hand.points);
            }
        });
    }
}
