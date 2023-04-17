import { Vector3, Animation } from "@babylonjs/core";

export const getChipAnimation = (
    initPosition: Vector3,
    finalPosition: Vector3,
): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesX = [];

    keyFramesX.push({
        frame: 0,
        value: initPosition.x,
    });

    keyFramesX.push({
        frame: frameRate,
        value: finalPosition.x,
    });

    xSlide.setKeys(keyFramesX);
    const ySlide = new Animation("ySlide", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesY = [];

    keyFramesY.push({
        frame: 0,
        value: initPosition.y,
    });

    keyFramesY.push({
        frame: frameRate,
        value: finalPosition.y,
    });

    ySlide.setKeys(keyFramesY);

    return { frameRate, animationArray: [xSlide, ySlide] };
};
