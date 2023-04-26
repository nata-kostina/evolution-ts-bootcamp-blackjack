import { Animation, Vector3 } from "@babylonjs/core";

export const getDealCardAnimation = (finalPosition: Vector3): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesX = [];

    keyFramesX.push({
        frame: 0,
        value: 5,
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
        value: 5,
    });

    keyFramesY.push({
        frame: frameRate,
        value: finalPosition.y,
    });

    ySlide.setKeys(keyFramesY);

    return { frameRate, animationArray: [xSlide, ySlide] };
};

export const getUnholeCardAnimation = (): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 5;

    const yRotation = new Animation("rotationY", "rotation.y", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesYR = [];

    keyFramesYR.push({
        frame: 0,
        value: Math.PI,
    });

    keyFramesYR.push({
        frame: frameRate,
        value: 0,
    });

    yRotation.setKeys(keyFramesYR);

    return { frameRate, animationArray: [yRotation] };
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

    const ySlide = new Animation("ySlide", "position.y", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesY = [];

    keyFramesY.push({
        frame: 0,
        value: position.y,
    });

    keyFramesY.push({
        frame: frameRate,
        value: 5,
    });

    ySlide.setKeys(keyFramesY);

    return { frameRate, animationArray: [xSlide, ySlide] };
};
