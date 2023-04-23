import { Vector2, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Path2, Curve3 } from "@babylonjs/core/Maths/math.path";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CSG } from "@babylonjs/core/Meshes/csg";
import { PolygonMeshBuilder } from "@babylonjs/core/Meshes/polygonMesh";
import { SolidParticleSystem } from "@babylonjs/core/Particles/solidParticleSystem";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

import MeshWriter from "meshwriter";
import { Scene } from "@babylonjs/core";
import { getBlackjackAnimation } from "../utils/animation/blackjack.animation";

const methodsObj = { Vector2, Vector3, Path2, Curve3, Color3, SolidParticleSystem, PolygonMeshBuilder, CSG, StandardMaterial, Mesh };

export class BlackjackNotificationCanvasElement {
    private readonly scene: Scene;

    public constructor(scene: Scene) {
        this.scene = scene;

        const Writer = MeshWriter(scene, { scale: 0.1, methods: methodsObj });
        const text = new Writer(
            "BLACKJACK",
            {
                "anchor": "center",
                "letter-height": 5,
                "color": "#1C3870",
                "position": {
                    z: 0,
                    x: 0,
                    y: 1,
                },
            },
        );
        const textMesh = text.getMesh() as Mesh;
        const pivotAt = new Vector3(0, 0, 0);
        const relativePosition = pivotAt.subtract(textMesh.position);
        textMesh.setPivotPoint(relativePosition);
        textMesh.scaling = new Vector3(0, 0, 0);
        textMesh.rotation.x = -Math.PI / 2;

        const { frameRate, animationArray } = getBlackjackAnimation();
        this.scene.beginDirectAnimation(textMesh,
            animationArray,
            0,
            frameRate,
            false,
            this.scene.getAnimationRatio(),
() => {
    textMesh.dispose();
});
    }
}
