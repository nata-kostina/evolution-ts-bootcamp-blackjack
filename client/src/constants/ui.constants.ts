import { ActionBtn } from "../types/ui.types";
import { Action, BetAction } from "../types/game.types";
import HitSVG from "../assets/img/actions/hit.svg";
import StandSVG from "../assets/img/actions/stand.svg";
import DoubleSVG from "../assets/img/actions/double.svg";
import SurrenderSVG from "../assets/img/actions/surrender.svg";
import InsuranceSVG from "../assets/img/actions/insurance.svg";
import BetSVG from "../assets/img/actions/bet.svg";
import UndoSVG from "../assets/img/actions/undo.svg";
import ResetSVG from "../assets/img/actions/reset.svg";
import SplitSVG from "../assets/img/actions/split.svg";
import RebetSVG from "../assets/img/actions/rebet.svg";
import AllInSVG from "../assets/img/actions/all_in.svg";

export const actionButtons: ActionBtn[] = [
    {
        action: Action.Bet,
        svgPath: BetSVG,
        type: "playerAction",
    },
    {
        action: Action.Hit,
        svgPath: HitSVG,
        type: "playerAction",
    },
    {
        action: Action.Stand,
        svgPath: StandSVG,
        type: "playerAction",
    },
    {
        action: Action.Double,
        svgPath: DoubleSVG,
        type: "playerAction",
    },
    {
        action: Action.Insurance,
        svgPath: InsuranceSVG,
        type: "playerAction",
    },
    {
        action: Action.Surrender,
        svgPath: SurrenderSVG,
        type: "playerAction",
    },
    {
        action: Action.Split,
        svgPath: SplitSVG,
        type: "playerAction",
    },
    {
        action: BetAction.Undo,
        svgPath: UndoSVG,
        type: "betAction",
    },
    {
        action: BetAction.Reset,
        svgPath: ResetSVG,
        type: "betAction",

    },
    {
        action: BetAction.Rebet,
        svgPath: RebetSVG,
        type: "betAction",

    },
    {
        action: BetAction.AllIn,
        svgPath: AllInSVG,
        type: "betAction",

    },
];
