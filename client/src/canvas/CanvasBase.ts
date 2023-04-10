/* eslint-disable @typescript-eslint/no-unused-vars */
import { HemisphericLight, ArcRotateCamera, Engine, Scene, Vector3, Color4, Camera } from "@babylonjs/core";
import Background from "../assets/img/background34.jpg";
import { GameMatrix } from "./GameMatrix";

export class CanvasBase {
    public readonly engine: Engine;
    public readonly canvas: HTMLCanvasElement;
    public readonly scene: Scene;
    public readonly camera: ArcRotateCamera;
    public readonly gameMatrix: GameMatrix;

    public constructor() {
        this.canvas = this.createCanvas();
        this.engine = this.createEngine(this.canvas);
        this.scene = this.createScene(this.engine);
        this.scene.clearColor = new Color4(0, 0, 0, 0.0000000000000001);
        this.camera = this.createCamera(this.scene);
        this.createLight(this.scene);
        const scalingLevel = this.engine.getHardwareScalingLevel();
        this.gameMatrix = new GameMatrix(this.engine.getRenderWidth(true) * scalingLevel,
            this.engine.getRenderHeight(true) * scalingLevel);
        window.addEventListener("resize", this.onResize);
        this.engine.runRenderLoop(this.onRender);
    }

    public start(): void {
        this.onResize();
    }

    public getGameMatrix(): GameMatrix {
        return this.gameMatrix;
    }

    protected createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.style.backgroundImage = `url(${Background})`;
        canvas.style.backgroundRepeat = "no-repeat";
        canvas.style.backgroundSize = "cover";
        canvas.style.backgroundPosition = "center";
        document.body.appendChild(canvas);
        return canvas;
    }

    protected createEngine(canvas: HTMLCanvasElement): Engine {
        return new Engine(canvas, true, {}, true);
    }

    protected createScene(engine: Engine): Scene {
        return new Scene(engine, {});
    }

    protected createCamera(scene: Scene): ArcRotateCamera {
        const camera = new ArcRotateCamera("Camera", -Math.PI * 0.5, Math.PI * 0.55, 3, Vector3.Zero(), scene);
        this.scene.setActiveCameraByName("Camera");
        // camera.attachControl(true);
        // camera.setTarget(BABYLON.Vector3.Zero());
        return camera;
    }

    protected createLight(scene: Scene): void {
        const light = new HemisphericLight("light", new Vector3(0, -2, -3), scene);
    }

    private onRender = () => {
        this.scene.render();
    };

    private onResize = () => {
        this.engine.resize();

        if (this.scene.activeCamera) {
            if (
                this.scene.getEngine().getRenderHeight() > this.scene.getEngine().getRenderWidth()
            ) {
                this.scene.activeCamera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;
            } else {
                this.scene.activeCamera.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
            }
        }

        const scalingLevel = this.engine.getHardwareScalingLevel();
        this.gameMatrix.update(this.engine.getRenderWidth(true) * scalingLevel,
            this.engine.getRenderHeight(true) * scalingLevel);
        const screenWidth = this.engine.getRenderWidth(true) * scalingLevel;
        const screenHeight = this.engine.getRenderHeight(true) * scalingLevel;
        this.gameMatrix.update(screenWidth, screenHeight);
    };
}
