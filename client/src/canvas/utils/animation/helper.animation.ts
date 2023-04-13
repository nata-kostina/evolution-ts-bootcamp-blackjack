import {
    Animation,
    Vector3,
} from "@babylonjs/core";

export const getHelperAnimation = (
    position: Vector3,
): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const ySlide = new Animation("highlight",
        "position.y",
        frameRate,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE);

    const keyFrames = [];

    keyFrames.push({
        frame: 0,
        value: position.y,
    });

    keyFrames.push({
        frame: frameRate,
        value: position.y + 0.03,
    });
    keyFrames.push({
        frame: frameRate * 2,
        value: position.y,
    });

    ySlide.setKeys(keyFrames);

    return { frameRate, animationArray: [ySlide] };
};
