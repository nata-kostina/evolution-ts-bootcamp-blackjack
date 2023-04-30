import randomstring from "randomstring";
import { PlayerID } from "../types";

export const generatePlayerID = (): PlayerID => {
    return `Player_id_${randomstring.generate()}`;
};
