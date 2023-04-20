/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AdvancedDynamicTexture, TextBlock, Control } from "@babylonjs/gui";
import { GroundMesh, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { PlayerSeatCanvasElement } from "./PlayerSeat.canvas.element";
import { DealerSeatCanvasElement } from "./DealerSeat.canvas.element copy";
import { GameMatrix } from "../GameMatrix";
import { ChipSetCanvasElement } from "./ChipSet.canvas.element";
import { Controller } from "../Controller";
import { BlackjackNotificationCanvasElement } from "./BlackjackNotification.canvas.element";
import { CardAnimation, HelperAnimation, SplitParams, UnholeCardPayload } from "../../types/canvas.types";
import {
    DealDealerCard,
    DealPlayerCard,
    GameResult,
} from "../../types/game.types";
// eslint-disable-next-line import/no-unassigned-import
import "@babylonjs/loaders/glTF";
import { HelperCanvasElement } from "./Helper.canvas.element";
import Border from "../../assets/img/scene/border.svg";
// import Border from "../../assets/img/seat/seat.svg";

export class SceneManager {
    public playerSeat: PlayerSeatCanvasElement;
    public dealerSeat: DealerSeatCanvasElement;
    public chipSet: ChipSetCanvasElement;
    private readonly scene: Scene;
    private readonly gameMatrix: GameMatrix;
    private readonly controller: Controller;
    private _helper: HelperCanvasElement;
    private _textGround: GroundMesh;
    public constructor(
        scene: Scene,
        matrix: GameMatrix,
        controller: Controller,
    ) {
        this.scene = scene;
        this.gameMatrix = matrix;
        this.controller = controller;
        this.playerSeat = new PlayerSeatCanvasElement(scene, matrix);
        this.dealerSeat = new DealerSeatCanvasElement(scene, matrix);
        this.chipSet = new ChipSetCanvasElement(scene, matrix, controller);
        this._helper = new HelperCanvasElement(scene, Vector3.Zero());
        this._helper.skin.isVisible = false;
        this.gameMatrix.addSubscriber([this.chipSet]);

        this._textGround = MeshBuilder.CreateGround(`rules-text-ground`,
            { width: 3, height: 3 },
            this.scene);
        this._textGround.rotation.x = -Math.PI * 0.5;

        const texture = AdvancedDynamicTexture.CreateForMesh(this._textGround);

        const textBlockBlackjack = new TextBlock(`rules-text-blackjack`, "Blackjack pays 3 to 2");
        textBlockBlackjack.color = "rgba(255, 255, 255, 0.25)";
        textBlockBlackjack.fontSize = 50;
        // textBlockBlackjack.x

        const textBlockDealer = new TextBlock(`rules-text-dealer`, "Dealer must stand on 17");
        textBlockDealer.color = "rgba(255, 255, 255, 0.25)";
        textBlockDealer.fontSize = 50;

        // texture.addControl(textBlock);

        // const textGroundInsurance = MeshBuilder.CreateGround(`text-ground-insurance`,
        //     { width: 2, height: 1 },
        //     this.scene);

        // textGroundInsurance.rotation.x = -Math.PI * 0.5;

        const textBlockInsurance = new TextBlock(`rules-text-insurance`, "Insurance pays 2 to 1");
        textBlockInsurance.color = "rgba(255, 255, 255, 0.425)";
        textBlockInsurance.fontSize = 50;
        textBlockInsurance.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;

        texture.addControl(textBlockBlackjack);
        texture.addControl(textBlockDealer);
        texture.addControl(textBlockInsurance);

        // const textGroundInsuranceMaterial = new StandardMaterial("material-insurance", this.scene);
        // textGroundInsuranceMaterial.diffuseTexture = new Texture(Border, this.scene);
        // textGroundInsuranceMaterial.diffuseTexture.hasAlpha = true;
        // textGroundInsurance.material = textGroundInsuranceMaterial;
    }

    public addContent(): void {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.boot().then(() => {
            // const axes = new AxesViewer(this.base.scene, 1);
        });
    }

    public init(activeHand: string): void {
        this.toggleChipAction(true);
        this.addInitialHand(activeHand);
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.toggleChipAction(register);
    }

    public async dealPlayerCard(newCard: DealPlayerCard): Promise<void> {
        await this.playerSeat.dealCard(newCard);
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
        await this.playerSeat.split({ oldHandID, newHandID, bet, points });
        const hand = this.playerSeat.getHand(oldHandID);
        if (hand) {
            this._helper.update(hand.position);
            this._helper.skin.isVisible = true;
        }
    }

    public addBlackjackNotification(): void {
        const notification = new BlackjackNotificationCanvasElement(this.scene);
    }

    public async unholeCard(payload: UnholeCardPayload): Promise<void> {
        await this.dealerSeat.unholeCard(payload);
    }

    public async removeHand(handID: string, result: GameResult): Promise<void> {
        await this.playerSeat.removeHand(handID, result);
    }

    public updateHelper({ handId }: { handId: string; }): void {
        const hand = this.playerSeat.getHand(handId);
        if (hand) {
            this._helper.update(hand.position);
            this._helper.skin.isVisible = true;
        }
    }

    public async resetScene(): Promise<void> {
        console.log("resetScene");
        this.dealerSeat.reset();
        this.toggleChipAction(false);
        this._helper.skin.isVisible = false;
        // this.playerSeat.dispose();
        // this.dealerSeat.dispose(false, true);
        // this._helper.dispose();
    }

    private async boot(): Promise<void> {}

    private addInitialHand(handID: string): void {
        this.playerSeat.addHand(handID);
        const initialHandElement = this.playerSeat.getHand(handID);
        if (initialHandElement) {
            this.controller.setBetElement(initialHandElement.betElement);
        }
    }
}
