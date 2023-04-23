import { ActionBtn } from "../types/ui.types";
import { Action, BetAction } from "../types/game.types";
import HitSVG from "../assets/img/actions/hit.svg";
import StandSVG from "../assets/img/actions/stand.svg";
import DoubleSVG from "../assets/img/actions/double.svg";
import SurenderSVG from "../assets/img/actions/surender.svg";
import InsuranceSVG from "../assets/img/actions/insurance.svg";
import BetSVG from "../assets/img/actions/bet.svg";
import UndoSVG from "../assets/img/actions/undo.svg";
import ResetSVG from "../assets/img/actions/reset.svg";
import SplitSVG from "../assets/img/actions/split.svg";

export const actionButtons: ActionBtn[] = [
    {
        action: Action.Bet,
        svgPath: BetSVG,
    },
    {
        action: Action.Hit,
        svgPath: HitSVG,
    },
    {
        action: Action.Stand,
        svgPath: StandSVG,
    },
    {
        action: Action.Double,
        svgPath: DoubleSVG,
    },
    {
        action: Action.Insurance,
        svgPath: InsuranceSVG,
    },
    {
        action: Action.Surender,
        svgPath: SurenderSVG,
    },
    {
        action: Action.Split,
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
