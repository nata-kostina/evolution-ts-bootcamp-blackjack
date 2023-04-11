/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    StandardMaterial,
    MeshBuilder,
    Texture,
    SceneLoader,
    Vector3,
    PhotoDome,
    AxesViewer,
    CreateGround,
    AssetsManager,
} from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import { PlayerSeatCanvasElement } from "./PlayerSeat.canvas.element";
import { DealerSeatCanvasElement } from "./DealerSeat.canvas.element copy";
import { GameMatrix } from "../GameMatrix";
import { ChipSetCanvasElement } from "./ChipSet.canvas.element";
import { Controller } from "../Controller";
import { BlackjackNotificationCanvasElement } from "./BlackjackNotification.canvas.element";
import { UnholeCardPayload } from "../../types/canvas.types";
import { NewCard } from "../../types/game.types";
import Background from "../../assets/img/background30.jpg";
// import Table from "../../assets/img/background30.jpg";
// eslint-disable-next-line import/no-unassigned-import
import "@babylonjs/loaders/glTF";

export class SceneCanvasElement {
    public playerSeat: PlayerSeatCanvasElement;
    public dealerSeat: DealerSeatCanvasElement;
    public chipSet: ChipSetCanvasElement;
    private readonly base: CanvasBase;
    private readonly gameMatrix: GameMatrix;

    public constructor(
        base: CanvasBase,
        matrix: GameMatrix,
        controller: Controller,
    ) {
        this.base = base;
        this.gameMatrix = matrix;
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
            // const table = CreateGround("table");
            // const tableMat = new StandardMaterial("tableMat");
            // tableMat.diffuseTexture = new Texture(Table, this.base.scene);
            // table.material = tableMat;
            // table.rotation.z = -Math.PI;
            // table.rotation.x = Math.PI * 0.5;
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            SceneLoader.ImportMeshAsync(
                "",
                "https://dl.dropbox.com/s/b52khhmuw47ano4/blackjack_table.glb?dl=0",
                "blackjack_table.glb",
                this.base.scene)
                .then((result) => {
                    const table = result.meshes[0];
                    // table.position = new Vector3(0, 0, 0);
                    // table.rotationQuaternion = null;
                    // table.setPivotPoint(new Vector3(0, 0, 0));
                    // table.position.y = -0.5;
                    // table.position.z = 1.7;
                    // // table.rotation.y = Math.PI * 1;
                    // // table.rotation.x = Math.PI * 0.4;
                    // table.rotation.x = -Math.PI * 0.5;
                    // table.scaling = new Vector3(1.7, 1.7, 1.7);

                    // const size = table.getBoundingInfo().boundingBox.extendSize;
                    // console.log(size);
                })
                .catch((error) => console.log(error));

            // const ground = MeshBuilder.CreateGround(
            //     "ground",
            //     { width: 4, height: 3 },
            //     this.base.scene,
            // );
            // const groundMaterial = new StandardMaterial(
            //     "ground-material",
            //     this.base.scene,
            // );
            // groundMaterial.diffuseTexture = new Texture(
            //     "https://i.postimg.cc/d0LVQ3Dr/background.jpg",
            //     this.base.scene,
            // );
            // ground.rotation.x = -Math.PI * 0.5;
            // ground.material = groundMaterial;
            // const matrix = this.gameMatrix.getMatrix();
            // const matrixSize = this.gameMatrix.getMatrixSize();
            // const cellWidth = this.gameMatrix.getCellWidth();
            // const cellHeight = this.gameMatrix.getCellHeight();
            // const matrixWidth = this.gameMatrix.getMatrixWidth();
            // const matrixHeight = this.gameMatrix.getMatrixHeight();

            // for (let i = 0; i < matrix.length; i++) {
            //     const cellType = matrix[i];
            //     const row = Math.floor(i / matrixSize);
            //     const column = i % matrixSize;
            //     const position = new Vector3(
            //         -matrixWidth * 0.5 + cellWidth * 0.5 + cellWidth * column,
            //         matrixHeight * 0.5 - (cellHeight * 0.5 + cellHeight * row),
            //         0,
            //     );
            // }
        });
    }

    public async dealPlayerCard(newCard: NewCard): Promise<void> {
        await this.playerSeat.dealCard(newCard);
    // this.playerSeat.updatePoints(newCard.points);
    }

    public async dealDealerCard(newCard: NewCard): Promise<void> {
        await this.dealerSeat.dealCard(newCard);
    // , () => {
    //     if (!isHoleCard(newCard.card)) {
    //         this.dealerSeat.updatePoints(newCard.points);
    //     }
    // });
    }

    public toggleChipAction(register: boolean): void {
        this.chipSet.toggleChipAction(register);
    }

    public addBlackjackNotification(): void {
        const notification = new BlackjackNotificationCanvasElement(this.base);
    }

    public async removeCards(): Promise<void> {
        await this.playerSeat.removeCards();
        await this.dealerSeat.removeCards();
    }

    public unholeCard(payload: UnholeCardPayload): void {
        this.dealerSeat.unholeCard(payload.card);
        this.dealerSeat.updatePoints(payload.points);
    }

    private async boot(): Promise<void> {}
}
