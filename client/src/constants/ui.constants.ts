import HitSVG from "../assets/img/actions/hit.svg";
import StandSVG from "../assets/img/actions/stand.svg";
import DoubleSVG from "../assets/img/actions/double.svg";
import SurenderSVG from "../assets/img/actions/surender.svg";
import InsuranceSVG from "../assets/img/actions/insurance.svg";
import BetSVG from "../assets/img/actions/bet.svg";
import { ActionBtn, BetActionBtn } from "../types/ui.types";
import { Action, BetAction } from "../types/game.types";
import UndoSVG from "../assets/img/actions/undo.svg";
import ResetSVG from "../assets/img/actions/reset.svg";

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
        svgPath: DoubleSVG,
    },
];

export const betActionBtns: BetActionBtn[] = [
    { action: BetAction.Undo, svgPath: UndoSVG },
    { action: BetAction.Reset, svgPath: ResetSVG },
];
