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
        text: "Bet",
    },
    {
        action: Action.Hit,
        svgPath: HitSVG,
        type: "playerAction",
        text: "Hit",
    },
    {
        action: Action.Stand,
        svgPath: StandSVG,
        type: "playerAction",
        text: "Stand",
    },
    {
        action: Action.Double,
        svgPath: DoubleSVG,
        type: "playerAction",
        text: "Double",
    },
    {
        action: Action.Insurance,
        svgPath: InsuranceSVG,
        type: "playerAction",
        text: "Insurance",
    },
    {
        action: Action.SkipInsurance,
        svgPath: SurrenderSVG,
        type: "playerAction",
        text: "Skip",
    },
    {
        action: Action.Surrender,
        svgPath: SurrenderSVG,
        type: "playerAction",
        text: "Surrender",
    },
    {
        action: Action.Split,
        svgPath: SplitSVG,
        type: "playerAction",
        text: "Split",
    },
    {
        action: BetAction.Undo,
        svgPath: UndoSVG,
        type: "betAction",
        text: "Undo",
    },
    {
        action: BetAction.Reset,
        svgPath: ResetSVG,
        type: "betAction",
        text: "Reset",

    },
    {
        action: BetAction.Rebet,
        svgPath: RebetSVG,
        type: "betAction",
        text: "Rebet",

    },
    {
        action: BetAction.AllIn,
        svgPath: AllInSVG,
        type: "betAction",
        text: "All in",
    },
];
