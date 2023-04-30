import { Animation, Vector3 } from "@babylonjs/core";

export const getDealCardAnimation = (startPosition: Vector3,
    finalPosition: Vector3,
):
{ frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesX = [];

    keyFramesX.push({
        frame: 0,
        value: startPosition.x,
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
        value: startPosition.y,
    });

    keyFramesY.push({
        frame: frameRate,
        value: finalPosition.y,
    });

    ySlide.setKeys(keyFramesY);

    const zSlide = new Animation("zSlide", "position.z", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesZ = [];

    keyFramesZ.push({
        frame: 0,
        value: startPosition.z,
    });

    keyFramesZ.push({
        frame: frameRate,
        value: finalPosition.z,
    });
    zSlide.setKeys(keyFramesZ);

    return { frameRate, animationArray: [xSlide, zSlide, ySlide] };
};

export const getUnholeCardAnimation = (startRotation: number,
    finalRotation: number): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 6;
    const xRotation = new Animation("rotationX", "rotation.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesXR = [];

    keyFramesXR.push({
        frame: 0,
        value: -Math.PI * 0.5,
    });

    keyFramesXR.push({
        frame: frameRate,
        value: finalRotation,
    });

    xRotation.setKeys(keyFramesXR);

    return { frameRate, animationArray: [xRotation] };
};
export const getTranslateYCardAnimation = (
    startPosition: Vector3,
    finalPosition: Vector3): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 6;

    const zSlide = new Animation("zSlide", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesZ = [];

    keyFramesZ.push({
        frame: 0,
        value: startPosition.y,
    });

    keyFramesZ.push({
        frame: frameRate,
        value: finalPosition.y,
    });
    zSlide.setKeys(keyFramesZ);

    return { frameRate, animationArray: [zSlide] };
};

export const getRemoveCardAnimation = (position: Vector3,
): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesX = [];

    keyFramesX.push({
        frame: 0,
        value: position.x,
    });

    keyFramesX.push({
        frame: frameRate,
        value: -5,
    });

    xSlide.setKeys(keyFramesX);

    const ySlide = new Animation("ySlide", "position.z", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesY = [];

    keyFramesY.push({
        frame: 0,
        value: position.z,
    });

    keyFramesY.push({
        frame: frameRate,
        value: 5,
    });

    ySlide.setKeys(keyFramesY);

    return { frameRate, animationArray: [xSlide, ySlide] };
};
