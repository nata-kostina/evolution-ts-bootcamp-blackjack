import { Card, PlayerID } from "./game.types";

export interface IBetCanvasElement {
    addChip: (value: number) => void;
    removeChip: () => void;
    updateBet: (bet: number) => void;
}

export type Cell = "0" | "chips" | "dealer-seat" | "deck";

export enum CardAnimation {
    Deal = "Deal",
    Remove = "Remove",
    Unhole = "Unhole",
    OpenDealerCard = "OpenDealerCard",
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

export enum SeatAnimation {
    Highlight = "Highlight",
}

export type UnholeCardPayload = {
    target: "dealer";
    card: Card;
    points: number;
};

export type SplitParams = {
    oldHandID: string;
    newHandID: string;
    bet: number;
    points: Array<number>;
    playerID: PlayerID; };
