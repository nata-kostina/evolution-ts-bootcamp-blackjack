import {
    Animation,
    Vector3,
} from "@babylonjs/core";

export const getDealCardAnimation = (matrixWidth: number,
    matrixHeight: number,
    initPosition: Vector3,
    cardsNum: number): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const xSlide = new Animation("xSlide", "position.x", frameRate, Animation.ANIMATIONTYPE_FLOAT);

    const keyFramesX = [];

    const endX = initPosition.x + cardsNum * 0.13;

    keyFramesX.push({
        frame: 0,
        value: matrixWidth,
    });

    keyFramesX.push({
        frame: frameRate,
        value: endX,
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
        value: initPosition.y,
    });

    ySlide.setKeys(keyFramesY);

    return { frameRate, animationArray: [xSlide, ySlide] };
};
