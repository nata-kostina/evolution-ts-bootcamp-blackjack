/* eslint-disable @typescript-eslint/no-unused-vars */
import { HemisphericLight, ArcRotateCamera, Engine, Scene, Vector3, Color4 } from "@babylonjs/core";
import Background from "../assets/img/background.jpg";

export class CanvasBase {
    public readonly engine: Engine;
    public readonly canvas: HTMLCanvasElement;
    public readonly scene: Scene;
    public readonly camera: ArcRotateCamera;
    public constructor() {
        this.canvas = this.createCanvas();
        this.engine = this.createEngine(this.canvas);
        this.scene = this.createScene(this.engine);
        this.scene.clearColor = new Color4(0, 0, 0, 0.0000000000000001);
        this.camera = this.createCamera(this.scene);
        this.createLight(this.scene);
        window.addEventListener("resize", this.onResize);
        this.engine.runRenderLoop(this.onRender);
    }

    public start(): void {
        this.onResize();
    }

    protected createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.style.backgroundImage = `url(${Background})`;
        canvas.style.backgroundRepeat = "no-repeat";
        canvas.style.backgroundSize = "cover";
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
        const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 3, Vector3.Zero(), scene);
        camera.setTarget(Vector3.Zero());
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
    };
}
