import {
    BackgroundMaterial,
    CreateGround,
    Scene,
    Texture,
    Vector3,
} from "@babylonjs/core";
import { PlayerSeatCanvasElement } from "./PlayerSeat.canvas.element";
import { DealerSeatCanvasElement } from "./DealerSeat.canvas.element";
import { GameMatrix } from "../GameMatrix";
import { ChipSetCanvasElement } from "./ChipSet.canvas.element";
import { CanvasController } from "../CanvasController";
import { SplitParams, UnholeCardPayload } from "../../types/canvas.types";
import {
    DealDealerCard,
    DealPlayerCard,
    GameResult,
    PlayerID,
    PlayerInstance,
    Seat,
} from "../../types/game.types";
import { HelperCanvasElement } from "./Helper.canvas.element";
import { assetsSrc } from "../../constants/assets.constants";
import { DeckCanvasElement } from "./Deck.canvas.element";

export class SceneManager {
    public playerSeats: Array<PlayerSeatCanvasElement> = [];
    public dealerSeat: DealerSeatCanvasElement;
    public chipSet: ChipSetCanvasElement;
    private readonly scene: Scene;
    private readonly gameMatrix: GameMatrix;
    private readonly controller: CanvasController;
    private _helper: HelperCanvasElement;
    private readonly _deck: DeckCanvasElement;

    public constructor(
        scene: Scene,
        matrix: GameMatrix,
        controller: CanvasController,
    ) {
        this.scene = scene;
        this.gameMatrix = matrix;
        this.controller = controller;

        const playerSeat = new PlayerSeatCanvasElement(
            scene,
            Seat.Middle,
            new Vector3(0, -0.2, 0),
            0,
        );

        this.playerSeats.push(playerSeat);

        this.dealerSeat = new DealerSeatCanvasElement(scene, matrix);
        this.chipSet = new ChipSetCanvasElement(scene, matrix, controller);
        this._helper = new HelperCanvasElement(scene, Vector3.Zero());
        this._helper.skin.isVisible = false;
        this._deck = new DeckCanvasElement(scene, matrix);

        this.gameMatrix.addSubscriber([this.chipSet, this.dealerSeat, this._deck]);
    }

    public addContent(): void {
        const ground = CreateGround("table", { width: 2.1, height: 0.6 }, this.scene);

        ground.position.y = 0.8;
        ground.position.z = 0.1;
        const backgroundMaterial = new BackgroundMaterial(
            "backgroundMaterial",
            this.scene,
        );
        const rulesTexture = this.scene.getTextureByName(
            assetsSrc.rules,
        ) as Texture;
        backgroundMaterial.diffuseTexture = rulesTexture;
        backgroundMaterial.diffuseTexture.hasAlpha = true;

        ground.material = backgroundMaterial;

        ground.rotation.x = -Math.PI * 0.5;

        this.chipSet.addContent();
        this._deck.addContent();
    }

    public init(): void {
        this.playerSeats.forEach((seat) => {
            seat.addContent();
        });
    }

    public updateSession(playerID: string, players: Record<string, PlayerInstance>): void {
        const data = Object.values(players);
        data.forEach((_data) => {
            const seat = this.playerSeats.find((_seat) => _seat.type === _data.seat);
            if (seat) {
                seat.updateData(_data);

                if (seat.playerID === playerID) {
                    const activeHand = seat.getHand(_data.activeHandID);
                    if (activeHand) {
                        this.controller.setBetElement(activeHand.betElement);
                    }
                }
            }
        });
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.toggleChipAction(register);
    }

    public async dealPlayerCard(newCard: DealPlayerCard): Promise<void> {
        const seat = this.playerSeats.find(
            (_seat) => _seat.playerID === newCard.playerID,
        );
        if (seat) {
            await seat.dealCard(newCard);
        }
    }

    public async dealDealerCard(newCard: DealDealerCard): Promise<void> {
        await this.dealerSeat.dealCard(newCard);
    }

    public async split({
        oldHandID,
        newHandID,
        bet,
        points,
        playerID,
    }: SplitParams): Promise<void> {
        const seat = this.playerSeats.find((_seat) => _seat.playerID === playerID);
        const hand = seat?.getHand(oldHandID);
        if (seat && hand) {
            await seat.split({ oldHandID, newHandID, bet, points, playerID });
            if (hand) {
                this._helper.update(hand.position);
                this._helper.skin.isVisible = true;
            }
        }
    }

    public async unholeCard(payload: UnholeCardPayload): Promise<void> {
        await this.dealerSeat.unholeCard(payload);
        this._helper.skin.isVisible = false;
    }

    public async removeHand(
        playerID: string,
        handID: string,
        result: GameResult,
    ): Promise<void> {
        const seat = this.playerSeats.find((_seat) => _seat.playerID === playerID);
        if (seat) {
            await seat.removeHand(handID, result);
        }
    }

    public updateHelper({ handId, playerID }: { handId: string; playerID: PlayerID; }): void {
        const seat = this.playerSeats.find((_seat) => _seat.playerID === playerID);
        if (seat) {
            if (seat.hands.length < 2) {
                this._helper.skin.isVisible = false;
                return;
            }
            const hand = seat.getHand(handId);

            if (hand) {
                this._helper.update(hand.position);
                this._helper.skin.isVisible = true;
            }
        }
    }

    public resetScene(): void {
        this.playerSeats.forEach((seat) => seat.reset());
        this.dealerSeat.reset();
        this.toggleChipAction(false);
        this._helper.skin.isVisible = false;
    }
}
