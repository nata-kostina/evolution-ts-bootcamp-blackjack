/* eslint-disable @typescript-eslint/no-unused-vars */
import { maxPlayersNum } from "../../constants/gameConstants";
import {
    controlPanelHeight,
    seatWidth,
} from "../../constants/canvas.constants";
import { ControlPanelCanvasElement } from "../canvasElements/ControlPanel.canvas.element";
import { BalanceCanvasElement } from "../canvasElements/Balance.canvas.element";
import { BetCanvasElement } from "../canvasElements/Bet.canvas.element";

export const drawScene = (
    ctx: CanvasRenderingContext2D | null | undefined,
): void => {
    if (ctx) {
        drawSeats(ctx);
        drawControlPanel(ctx);
    }
};

const drawSeats = (ctx: CanvasRenderingContext2D): void => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.width;

    const spaceForOneSeat = Math.round(width / maxPlayersNum);
    const middleOfSpace = Math.round(spaceForOneSeat / 2);
    // let startXcoord = middleOfSpace - Math.round(seatWidth / 2);

    const sideSeatsHeight = Math.round(height / 4);
    const middleSeatsHeight = Math.round(height / 3);
    const seatHeights = [
        sideSeatsHeight,
        middleSeatsHeight,
        middleSeatsHeight,
        sideSeatsHeight,
    ];
    for (let i = 0; i < maxPlayersNum; i++) {
        // const seat = new SeatCanvasElement(startXcoord, seatHeights[i]);
        // seat.draw(ctx);
        // startXcoord += spaceForOneSeat;
    }
};

const drawControlPanel = (
    ctx: CanvasRenderingContext2D,
): void => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const panelController = new ControlPanelCanvasElement(height, width);
    panelController.draw(ctx);

    const balanceElement = new BalanceCanvasElement(height, width);
    balanceElement.draw(ctx);

    // const betElement = new BetCanvasElement(height, width);
    // betElement.draw(ctx);
};
const drawBalance = (ctx: CanvasRenderingContext2D): void => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.width;

    // ctx.rect
};
