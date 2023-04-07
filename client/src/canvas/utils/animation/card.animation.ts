import {
    Animation,
    Vector3,
} from "@babylonjs/core";

export const getDealCardAnimation = (matrixWidth: number,
    matrixHeight: number,
    finalPosition: Vector3,
): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesX = [];

    keyFramesX.push({
        frame: 0,
        value: matrixWidth,
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
        value: matrixHeight,
    });

    keyFramesY.push({
        frame: frameRate,
        value: finalPosition.y,
    });

    ySlide.setKeys(keyFramesY);

    return { frameRate, animationArray: [xSlide, ySlide] };
};

export const getRemoveCardAnimation = (matrixWidth: number,
    matrixHeight: number,
    position: Vector3,
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
        value: -matrixWidth,
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
        value: matrixHeight,
    });

    ySlide.setKeys(keyFramesY);

    return { frameRate, animationArray: [xSlide, ySlide] };
};
