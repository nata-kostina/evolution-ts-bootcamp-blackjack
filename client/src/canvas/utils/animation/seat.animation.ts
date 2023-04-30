import { Animation, Color3, Vector3 } from "@babylonjs/core";

export const getSeatAnimation = ():
{ frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 30;

    const highlight = new Animation(
        "highlight-seat", "material.diffuseColor", frameRate, Animation.ANIMATIONTYPE_COLOR3, Animation.ANIMATIONLOOPMODE_CYCLE);

    const keys = [];
    keys.push({
        frame: 0,
        value: Color3.FromHexString("#FFFFFF"),
    });

    keys.push({
        frame: frameRate * 0.7,
        value: Color3.FromHexString("#12525F"),
    });

    keys.push({
        frame: frameRate,
        value: Color3.FromHexString("#FFFFFF"),
    });

    highlight.setKeys(keys);

    const pulse = new Animation(
        "pulse-seat", "scaling", frameRate, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);

    const keysScaling = [];
    keysScaling.push({
        frame: 0,
        value: new Vector3(1, 1, 1),
    });

    keysScaling.push({
        frame: frameRate * 0.7,
        value: new Vector3(1.2, 1.2, 1.2),
    });
    keysScaling.push({
        frame: frameRate,
        value: new Vector3(1, 1, 1),
    });

    pulse.setKeys(keysScaling);
    return { frameRate, animationArray: [highlight, pulse] };
};
