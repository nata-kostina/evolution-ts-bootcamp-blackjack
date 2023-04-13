/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CanvasBase } from "../CanvasBase";
import { PlayerSeatCanvasElement } from "./PlayerSeat.canvas.element";
import { DealerSeatCanvasElement } from "./DealerSeat.canvas.element copy";
import { GameMatrix } from "../GameMatrix";
import { ChipSetCanvasElement } from "./ChipSet.canvas.element";
import { Controller } from "../Controller";
import { BlackjackNotificationCanvasElement } from "./BlackjackNotification.canvas.element";
import { SplitParams, UnholeCardPayload } from "../../types/canvas.types";
import { Bet, DealDealerCard, DealPlayerCard, GameResult } from "../../types/game.types";
// eslint-disable-next-line import/no-unassigned-import
import "@babylonjs/loaders/glTF";

export class SceneManager {
    public playerSeat: PlayerSeatCanvasElement;
    public dealerSeat: DealerSeatCanvasElement;
    public chipSet: ChipSetCanvasElement;
    private readonly base: CanvasBase;
    private readonly gameMatrix: GameMatrix;
    private readonly controller: Controller;

    public constructor(
        base: CanvasBase,
        matrix: GameMatrix,
        controller: Controller,
    ) {
        this.base = base;
        this.gameMatrix = matrix;
        this.controller = controller;
        this.playerSeat = new PlayerSeatCanvasElement(this.base, matrix);
        this.dealerSeat = new DealerSeatCanvasElement(this.base, matrix);
        this.chipSet = new ChipSetCanvasElement(
            this.base,
            this.gameMatrix,
            controller,
        );

        // const dome = new PhotoDome(
        //     "background",
        //     Background,
        //     {
        //         resolution: 32,
        //         size: 8,
        //     },
        //     this.base.scene,
        // );
        // dome.setPivotPoint(new Vector3(0, 0, -4));

        // dome.rotation = new Vector3(-Math.PI * 0.5, 0, 0);
        // dome.position.z = 2.5;
        // dome.position.y = -3;
        // dome.fovMultiplier = 1;
        // dome.imageMode = PhotoDome.MODE_MONOSCOPIC;
        // const localAxes = new AxesViewer(this.base.scene, 1);
        // localAxes.xAxis.parent = dome;
        // localAxes.yAxis.parent = dome;
        // localAxes.zAxis.parent = dome;

        this.gameMatrix.addSubscriber([this.chipSet]);
    }

    public addContent(): void {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.boot().then(() => {
            // const axes = new AxesViewer(this.base.scene, 1);
        });
    }

    public async dealPlayerCard(newCard: DealPlayerCard): Promise<void> {
        await this.playerSeat.dealCard(newCard);
    }

    public async dealDealerCard(newCard: DealDealerCard): Promise<void> {
        await this.dealerSeat.dealCard(newCard);
    }

    public async split({ oldHandID, newHandID, bet, points }: SplitParams): Promise<void> {
        await this.playerSeat.split({ oldHandID, newHandID, bet, points });
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.toggleChipAction(register);
    }

    public addBlackjackNotification(): void {
        const notification = new BlackjackNotificationCanvasElement(this.base);
    }

    public async removeCards(): Promise<void> {
        // await this.playerSeat.removeCards();
        await this.dealerSeat.removeCards();
    }

    public async unholeCard(payload: UnholeCardPayload): Promise<void> {
        await this.dealerSeat.unholeCard(payload);
    }

    public addInitialHand(handID: string): void {
        this.playerSeat.addHand(handID);
        const initialHandElement = this.playerSeat.getHand(handID);
        if (initialHandElement) {
            this.controller.setBetElement(initialHandElement.betElement);
        }
    }

    public async highllightActiveHand(handID: string): Promise<void> {
        await this.playerSeat.highllightActiveHand(handID);
    }

    public async removeHand(handID: string, result: GameResult): Promise<void> {
        await this.playerSeat.removeHand(handID, result);
    }

    private async boot(): Promise<void> {}
}
