import uuid from "react-uuid";
import { ChipItem, ActionBtn, Action } from "../types/types";
import Chip1 from "../assets/img/chips/chip_1.png";
import Chip5 from "../assets/img/chips/chip_5.png";
import Chip10 from "../assets/img/chips/chip_10.png";
import Chip15 from "../assets/img/chips/chip_15.png";
import Chip50 from "../assets/img/chips/chip_50.png";
import Chip100 from "../assets/img/chips/chip_100.png";
import HitSVG from "../assets/img/actions/hit.svg";
import StandSVG from "../assets/img/actions/stand.svg";
import DoubleSVG from "../assets/img/actions/double.svg";
import SurenderSVG from "../assets/img/actions/surender.svg";
import InsuranceSVG from "../assets/img/actions/insurance.svg";

export const chipSet: ChipItem[] = [
    {
        id: uuid(),
        value: 1,
        img: Chip1,
    },
    {
        id: uuid(),
        value: 5,
        img: Chip5,
    }, {
        id: uuid(),
        value: 10,
        img: Chip10,
    }, {
        id: uuid(),
        value: 15,
        img: Chip15,
    }, {
        id: uuid(),
        value: 50,
        img: Chip50,
    }, {
        id: uuid(),
        value: 100,
        img: Chip100,
    }];

export const maxPlayersNum = 1;

export const actionButtons: ActionBtn[] = [
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
];
