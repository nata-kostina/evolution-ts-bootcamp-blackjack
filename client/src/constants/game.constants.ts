import uuid from "react-uuid";

import Chip1 from "../assets/img/chips/chip_1.png";
import Chip5 from "../assets/img/chips/chip_5.png";
import Chip10 from "../assets/img/chips/chip_10.png";
import Chip15 from "../assets/img/chips/chip_15.png";
import Chip50 from "../assets/img/chips/chip_50.png";
import Chip100 from "../assets/img/chips/chip_100.png";

import { ChipItem } from "../types/game.types";

export const chipSet: ChipItem[] = [
    {
        id: uuid(),
        name: "chip-1",
        value: 1,
        img: Chip1,
    },
    {
        id: uuid(),
        name: "chip-5",
        value: 5,
        img: Chip5,
    },
    {
        id: uuid(),
        name: "chip-10",
        value: 10,
        img: Chip10,
    },
    {
        id: uuid(),
        name: "chip-15",
        value: 15,
        img: Chip15,
    },
    {
        id: uuid(),
        name: "chip-50",
        value: 50,
        img: Chip50,
    },
    {
        id: uuid(),
        name: "chip-100",
        value: 100,
        img: Chip100,
    },
];

export const maxPlayersNum = 1;

export const chipsValues = chipSet.map((chip) => chip.value);
