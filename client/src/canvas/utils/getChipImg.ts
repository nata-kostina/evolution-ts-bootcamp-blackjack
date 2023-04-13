import { chipSet } from "../../constants/game.constants";

export const getChipImg = (value: number): string => {
    const ch = chipSet.find((chip) => chip.value === value);
    return ch ? ch.img : "";
};
