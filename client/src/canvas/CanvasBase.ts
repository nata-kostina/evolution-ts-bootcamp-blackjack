import {
    ArcRotateCamera,
    Engine,
    Scene,
    Vector3,
    Color4,
    Camera,
    HemisphericLight,
} from "@babylonjs/core";
import { GameMatrix } from "./GameMatrix";

export class CanvasBase {
    private readonly _scene: Scene;
    private readonly _engine: Engine;
    private readonly _canvas: HTMLCanvasElement;
    private readonly _camera: ArcRotateCamera;
    private readonly _gameMatrix: GameMatrix;

    public constructor(canvasElement: HTMLCanvasElement) {
        this._canvas = canvasElement;
        this._engine = this.createEngine(this._canvas);
        this._scene = this.createScene(this._engine);
        this._scene.clearColor = new Color4(0, 0, 0, 0.0000000000000001);
        this._camera = this.createCamera();
        this.createLight();

        const scalingLevel = this._engine.getHardwareScalingLevel();
        this._gameMatrix = new GameMatrix(this._engine.getRenderWidth(true) * scalingLevel,
            this._engine.getRenderHeight(true) * scalingLevel);

        window.addEventListener("resize", this.onResize);
        this._engine.runRenderLoop(this.onRender);
    }

    public get scene(): Scene {
        return this._scene;
    }

    public getGameMatrix(): GameMatrix {
        return this._gameMatrix;
    }

    private createEngine(canvas: HTMLCanvasElement): Engine {
        return new Engine(canvas, true, {}, true);
    }

    private createScene(_engine: Engine): Scene {
        return new Scene(_engine, {});
    }

    private createCamera(): ArcRotateCamera {
        const camera = new ArcRotateCamera("Camera", -Math.PI * 0.5, Math.PI * 0.54, 2.8, Vector3.Zero(), this._scene);
        this._scene.setActiveCameraByName("Camera");
        return camera;
    }

    private createLight(): void {
        const light = new HemisphericLight("light", new Vector3(0, -1, -1), this._scene);
        light.intensity = 1.5;
    }

    private onRender = () => {
        this._scene.render();
    };

    private onResize = () => {
        this._engine.resize();

        if (this._scene.activeCamera) {
            if (
                this._scene.getEngine().getRenderHeight() > this._scene.getEngine().getRenderWidth()
            ) {
                this._scene.activeCamera.fovMode = Camera.FOVMODE_HORIZONTAL_FIXED;
            } else {
                this._scene.activeCamera.fovMode = Camera.FOVMODE_VERTICAL_FIXED;
            }
        }

        const scalingLevel = this._engine.getHardwareScalingLevel();
        const screenWidth = this._engine.getRenderWidth(true) * scalingLevel;
        const screenHeight = this._engine.getRenderHeight(true) * scalingLevel;
        this._gameMatrix.update(screenWidth, screenHeight);
    };
}
