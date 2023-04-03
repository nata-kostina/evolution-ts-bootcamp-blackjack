/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unknown-property */
import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import BackgroundImage from "../assets/img/background.jpg";
import { useRefDimensions } from "./utils/useRefDimensions.utils";
import { drawScene } from "./utils/drawScene";
import { game } from "../store";
import { GameMode } from "../types/types";

const animation = (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
) => {
    /* Add transparent background */
    console.log("Animation call");
    context.clearRect(0, 0, width, height);

    drawScene(context);
    requestAnimationFrame(() =>
      animation(context, width, height),
    );
};
export const GameCanvas = observer(() => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { height, width } = useRefDimensions(containerRef);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");

            canvas.height = height;
            canvas.width = width;

            if (context) {
                animation(context, width, height);
                // drawScene(context);
                // animation(context, particles, width, height, hueColor, setHueColor);
            }
        }
    }, [canvasRef.current]);

    useEffect(() => {
        game.startGame(GameMode.Single);
        return () => {
            console.log("Unmount game Canvas");
            game.finishGame();
        };
    }, []);
    console.log("mount Canvas");

    return (
        <div
            ref={containerRef}
            style={{
                height: "100vh",
                width: "100vw",
                position: "relative",
            }}
        >
            <canvas
                // id="canvas"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width,
                    height,
                    backgroundImage: `url(${BackgroundImage})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                }}
                ref={canvasRef}
            />
        </div>
    );
});
