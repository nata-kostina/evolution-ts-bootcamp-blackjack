import { Vector3, Animation } from "@babylonjs/core";

export const getBlackjackAnimation = (): { frameRate: number; animationArray: Array<Animation>; } => {
    const frameRate = 8;

    const pulse = new Animation("pulse", "scaling", frameRate, Animation.ANIMATIONTYPE_VECTOR3);

    const keyFrames = [];

    keyFrames.push({
        frame: 0,
        value: new Vector3(0, 0, 0),
    });

    keyFrames.push({
        frame: 4,
        value: new Vector3(1.1, 1.1, 1.1),
    });

    keyFrames.push({
        frame: 6,
        value: new Vector3(1, 1, 1),
    });
    keyFrames.push({
        frame: frameRate,
        value: new Vector3(0.6, 0.6, 0.6),
    });

    pulse.setKeys(keyFrames);

    return {
        frameRate,
        animationArray: [pulse],
    };
};
