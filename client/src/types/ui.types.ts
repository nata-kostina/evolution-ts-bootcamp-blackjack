import { Action, BetAction } from "./game.types";

export type ActionBtn = {
    action: Action | BetAction;
    svgPath: string;
};

export type BetActionBtn = {
    action: BetAction;
    svgPath: string;
};
