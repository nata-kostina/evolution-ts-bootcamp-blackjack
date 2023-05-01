import { Action, BetAction } from "./game.types";

export type ActionBtn = {
    action: Action | BetAction;
    svgPath: string;
    type: "playerAction" | "betAction";
    text: string;
};

export type BetActionBtn = {
    action: BetAction;
    svgPath: string;
};

export type UiActionBtn = {
    isVisible: boolean;
    isDisabled: boolean;
    type: "playerAction" | "betAction";
};
