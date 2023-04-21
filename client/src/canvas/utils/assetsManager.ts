import { AssetsManager, Scene, Texture } from "@babylonjs/core";
import { assetsSrc } from "../../constants/assets.constants";

export class AssetsLoader {
    private readonly scene: Scene;
    private readonly assetsManager: AssetsManager;
    private _textures: Record<string, Texture> = {};

    public constructor(scene: Scene) {
        this.assetsManager = new AssetsManager(scene);
        this.assetsManager.useDefaultLoadingScreen = false;
        this.scene = scene;
    }

    public get textures(): Record<string, Texture> {
        return this._textures;
    }

    public async preload(): Promise<void> {
        Object.keys(assetsSrc).forEach((key) => {
            this.assetsManager.addTextureTask(key, assetsSrc[key as keyof typeof assetsSrc]);
        });
        // chipSet.forEach((obj) => {
        //     const img = this.assetsManager.addTextureTask(obj.name, obj.img);
        //     img.onSuccess = (t) => {
        //         this._textures[t.name] = t.texture;
        //     };
        // });
        // this.assetsManager.addTextureTask(obj.name, Rules);

        return this.assetsManager.loadAsync();
    }
}
