/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BackgroundMaterial, MeshBuilder, Texture, Vector3 } from "@babylonjs/core";
import { CanvasBase } from "../CanvasBase";
import Background from "../../assets/img/background.jpg";

export class CardCanvasElement {
    private readonly base: CanvasBase;

    public constructor(base: CanvasBase) {
        this.base = base;
    }

    public addContent(): void {
        // console.log("CardCanvasElement addContent");
        // const card = MeshBuilder.CreateGround("box", { width: 1.5, height: 2 }, this.base.scene);
        // card.scaling = new Vector3(0.3, 0.3, 0.3);
        // const cardMaterial = new BackgroundMaterial("card-material", this.base.scene);
        // cardMaterial.diffuseTexture = new Texture("https://www.improvemagic.com/wp-content/uploads/2020/11/k4.png");
        // cardMaterial.diffuseTexture.hasAlpha = true;
        // card.material = cardMaterial;
    }

    public animateDealCard(): void {

    }
}
