/* eslint-disable @typescript-eslint/no-unused-vars */
import { BackgroundMaterial, CreateGround, Scene, Texture, Vector3 } from "@babylonjs/core";
import { PlayerSeatCanvasElement } from "./PlayerSeat.canvas.element";
import { DealerSeatCanvasElement } from "./DealerSeat.canvas.element copy";
import { GameMatrix } from "../GameMatrix";
import { ChipSetCanvasElement } from "./ChipSet.canvas.element";
import { CanvasController } from "../CanvasController";
import { SplitParams, UnholeCardPayload } from "../../types/canvas.types";
import {
    DealDealerCard,
    DealPlayerCard,
    GameResult,
    PlayerInstance,
} from "../../types/game.types";
// eslint-disable-next-line import/no-unassigned-import
import "@babylonjs/loaders/glTF";
import { HelperCanvasElement } from "./Helper.canvas.element";
import { assetsSrc } from "../../constants/assets.constants";

export class SceneManager {
    public playerSeats: Array<PlayerSeatCanvasElement> = [];
    // public playerSeat: PlayerSeatCanvasElement;
    public dealerSeat: DealerSeatCanvasElement;
    public chipSet: ChipSetCanvasElement;
    private readonly scene: Scene;
    private readonly gameMatrix: GameMatrix;
    private readonly controller: CanvasController;
    private _helper: HelperCanvasElement;

    public constructor(
        scene: Scene,
        matrix: GameMatrix,
        controller: CanvasController,
    ) {
        this.scene = scene;
        this.gameMatrix = matrix;
        this.controller = controller;
        // this.playerSeat = new PlayerSeatCanvasElement(scene, matrix);
        this.dealerSeat = new DealerSeatCanvasElement(scene, matrix);
        this.chipSet = new ChipSetCanvasElement(scene, matrix, controller);
        this._helper = new HelperCanvasElement(scene, Vector3.Zero());
        this._helper.skin.isVisible = false;

        this.gameMatrix.addSubscriber([this.chipSet, this.dealerSeat]);
    }

    public addContent(): void {
        const ground = CreateGround("ground1", { width: 2.1, height: 0.6 }, this.scene);
        ground.position.y = 0.8;
        ground.position.z = 0.3;
        const backgroundMaterial = new BackgroundMaterial("backgroundMaterial", this.scene);
        const rulesTexture = this.scene.getTextureByName(assetsSrc.rules) as Texture;
        backgroundMaterial.diffuseTexture = rulesTexture;
        backgroundMaterial.diffuseTexture.hasAlpha = true;

        ground.material = backgroundMaterial;

        ground.rotation.x = -Math.PI * 0.5;

        this.chipSet.addContent();
        // this.playerSeat.addContent();
    }

    // public init(activeHand: string): void {
    //     this.resetScene();
    //     this.toggleChipAction(true);
    //     this.addInitialHand(activeHand);
    // }

    public init(playerID: string, players: Record<string, PlayerInstance>): void {
        this.resetScene();
        const playersIds = Object.keys(players);

        playersIds.forEach((id, index) => {
            const x = (index + 1) / (playersIds.length + 1) * this.gameMatrix.matrixWidth - this.gameMatrix.matrixWidth * 0.5;
            const position = new Vector3(x, 0, 0);
            const seat = new PlayerSeatCanvasElement(this.scene, position, id);
            seat.addContent();
            this.playerSeats.push(seat);

            const player = players[id];
            const initialHandElement = seat.addHand(player.activeHandID);
            if (playerID === id) {
                this.controller.setBetElement(initialHandElement.betElement);
            }
        });
        this.toggleChipAction(true);
    }

    public updateSession(players: Record<string, PlayerInstance>): void {
        this.playerSeats.forEach((seat) => seat.updateSeat(players[seat.playerID]));
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.toggleChipAction(register);
    }

    public async dealPlayerCard(newCard: DealPlayerCard): Promise<void> {
        // await this.playerSeat.dealCard(newCard);
        const seat = this.playerSeats.find((_seat) => _seat.playerID === newCard.playerID);
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
    }: SplitParams): Promise<void> {
        // await this.playerSeat.split({ oldHandID, newHandID, bet, points });
        // const hand = this.playerSeat.getHand(oldHandID);
        // if (hand) {
        //     this._helper.update(hand.position);
        //     this._helper.skin.isVisible = true;
        // }
    }

    public async unholeCard(payload: UnholeCardPayload): Promise<void> {
        await this.dealerSeat.unholeCard(payload);
        this._helper.skin.isVisible = false;
    }

    public async removeHand(playerID: string, handID: string, result: GameResult): Promise<void> {
        const seat = this.playerSeats.find((_seat) => _seat.playerID === playerID);
        if (seat) {
            await seat.removeHand(handID, result);
        }
    }

    public updateHelper({ handId }: { handId: string; }): void {
        // const hand = this.playerSeat.getHand(handId);
        // if (hand) {
        //     this._helper.update(hand.position);
        //     this._helper.skin.isVisible = true;
        // }
    }

    public resetScene(): void {
        this.playerSeats.forEach((seat) => { seat.reset(); seat.dispose(); });
        this.playerSeats = [];
        this.dealerSeat.reset();
        this.toggleChipAction(false);
        this._helper.skin.isVisible = false;
        // this.playerSeat.reset();
    }

    private addInitialHand(handID: string): void {
        // this.playerSeat.addHand(handID);
        // const initialHandElement = this.playerSeat.getHand(handID);
        // if (initialHandElement) {
        // this.controller.setBetElement(initialHandElement.betElement);
        // }
    }
}
