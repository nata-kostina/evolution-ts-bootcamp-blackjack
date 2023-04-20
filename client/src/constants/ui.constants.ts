import HitSVG from "../assets/img/actions/hit3.svg";
import StandSVG from "../assets/img/actions/stand2.svg";
import DoubleSVG from "../assets/img/actions/double.svg";
import SurenderSVG from "../assets/img/actions/surender2.svg";
import InsuranceSVG from "../assets/img/actions/insurance.svg";
import BetSVG from "../assets/img/actions/bet4.svg";
import { ActionBtn } from "../types/ui.types";
import { Action, BetAction } from "../types/game.types";
import UndoSVG from "../assets/img/actions/undo2.svg";
import ResetSVG from "../assets/img/actions/reset2.svg";
import SplitSVG from "../assets/img/actions/split.svg";

export const actionButtons: ActionBtn[] = [
    {
        action: Action.BET,
        svgPath: BetSVG,
    },
    {
        action: Action.HIT,
        svgPath: HitSVG,
    },
    {
        action: Action.STAND,
        svgPath: StandSVG,
    },
    {
        action: Action.DOUBLE,
        svgPath: DoubleSVG,
    },
    {
        action: Action.INSURANCE,
        svgPath: InsuranceSVG,
    },
    {
        action: Action.SURENDER,
        svgPath: SurenderSVG,
    },
    {
        action: Action.SPLIT,
        svgPath: SplitSVG,
    },
    {
        action: BetAction.Undo,
        svgPath: UndoSVG,
    },
    {
        action: BetAction.Reset,
        svgPath: ResetSVG,
    },
];
