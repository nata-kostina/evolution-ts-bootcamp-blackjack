import {
    Animation,
    Color3,
    Vector3,
} from "@babylonjs/core";
import { HandAnimation } from "../../../types/canvas.types";

export const getSplitHandAnimation = (
    matrixWidth: number,
    matrixHeight: number,
    type: HandAnimation,
    initPosition: Vector3,
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
        value: type === HandAnimation.ToLeft ? initPosition.x - 0.7 : initPosition.x + 0.7,
    });

    xSlide.setKeys(keyFramesX);

    return { frameRate, animationArray: [xSlide] };
};

export const getHighlightHandAnimation = (): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const colorChange = new Animation("highlight",
        "diffuseColor",
        frameRate,
        Animation.ANIMATIONTYPE_COLOR3,
        Animation.ANIMATIONLOOPMODE_CYCLE);

    const keyFrames = [];

    const baseColor = Color3.FromHexString("#00531F");
    const highlightedColor = new Color3(0.5, 0.71, 0.16);

    keyFrames.push({
        frame: 0,
        value: baseColor,
    });

    keyFrames.push({
        frame: frameRate,
        value: highlightedColor,
    });
    keyFrames.push({
        frame: frameRate * 2,
        value: baseColor,
    });

    colorChange.setKeys(keyFrames);

    return { frameRate, animationArray: [colorChange] };
};
