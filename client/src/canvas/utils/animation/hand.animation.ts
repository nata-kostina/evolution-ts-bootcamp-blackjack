import { Animation, Vector3 } from "@babylonjs/core";
import { HandAnimation } from "../../../types/canvas.types";

export const getSplitHandAnimation = (
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
        value: type === HandAnimation.ToLeft ? initPosition.x - 0.6 : initPosition.x + 0.6,
    });

    xSlide.setKeys(keyFramesX);

    return { frameRate, animationArray: [xSlide] };
};
