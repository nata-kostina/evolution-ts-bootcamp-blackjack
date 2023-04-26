import { Card } from "./game.types";

export type MatrixProps = {
    map: Cell[];
    size: number;
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
};

export interface IBetCanvasElement {
    addChip: (value: number) => void;
    removeChip: () => void;
    updateBet: (bet: number) => void;
}

export type Cell = "0" | "chips" | "player-seat" | "dealer-seat";

export enum CardAnimation {
    Deal = "Deal",
    Remove = "Remove",
    Unhole = "Unhole",
}

export enum HandAnimation {
    ToLeft = "ToLeft",
    ToRight = "ToRight",
    Highlight = "Highlight",
}

export enum ChipAnimation {
    Add = "Add",
    Remove = "Remove",
    Win = "Win",
    Lose = "Lose",
}

export enum HelperAnimation {
    Pulse = "Pulse",
}

export type UnholeCardPayload = {
    target: "dealer";
    card: Card;
    points: number;
};

export type SplitParams = { oldHandID: string; newHandID: string; bet: number; points: Array<number>; };
