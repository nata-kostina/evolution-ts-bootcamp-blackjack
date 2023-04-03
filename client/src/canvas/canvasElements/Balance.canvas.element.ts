import { game } from "../../store";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class BalanceCanvasElement {
    private x: number;
    private y: number;
    private height: number;
    private width: number;

    public constructor(canvasHeight: number, canvasWidth: number) {
    // this.y = canvasHeight - this.height;
    // this.width = canvasWidth;
        this.x = 0;
        this.y = 10;
        this.height = 80;
        this.width = 90;
    }

    public draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "#FFFFFF";
        context.fillRect(this.x, this.y, this.width, this.height);
        if (game.ui.player) {
            context.font = "18px serif";
            context.fillStyle = "#000000";
            context.fillText(
        `Balance: ${game.ui.player.balance}`,
        this.x,
        this.y + this.height,
            );
        }
    }
}
