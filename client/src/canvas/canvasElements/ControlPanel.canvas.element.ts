import { controlPanelBorderWidth, controlPanelHeight } from "../../constants/canvas.constants";

export class ControlPanelCanvasElement {
    private x = 0;
    private y: number;
    private height = controlPanelHeight;
    private width: number;

    public constructor(canvasHeight: number, canvasWidth: number) {
        this.y = canvasHeight - this.height;
        this.width = canvasWidth;
    }

    public draw(context: CanvasRenderingContext2D): void {
        context.fillStyle = "yellow";
        context.fillRect(this.x, this.y, this.width, this.height);

        const gradient = context.createLinearGradient(this.x,
            this.y - Math.round(controlPanelBorderWidth / 2),
            this.x,
            this.y + Math.round(controlPanelBorderWidth / 2));
        gradient.addColorStop(0, "#8f6B29");
        gradient.addColorStop(0.7, "#FDE08D");
        gradient.addColorStop(1, "#DF9F28");

        context.strokeStyle = gradient;
        context.lineWidth = controlPanelBorderWidth;

        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.width, this.y);
        context.stroke();
        context.closePath();
    }
}
