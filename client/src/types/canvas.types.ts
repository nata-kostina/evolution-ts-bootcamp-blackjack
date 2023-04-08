import { Card } from "./game.types";

export type MatrixProps = {
    map: Cell[];
    size: number;
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
};

export interface CanvasElement {
    update: (data: MatrixProps) => void;
}

export type Cell = "0" | "chips" | "player-seat" | "dealer-seat" | "dealer-points" | "player-points" | "bet";

export enum CardAnimation {
    Deal = "Deal",
    Remove = "Remove",
    Unhole = "Unhole",
}

export type UnholeCardPayload = {
    target: "dealer";
    card: Card;
    points: number;
};
