import uuid from "react-uuid";
import { BetItem } from "../types/types";

export const betsSet: BetItem[] = [{
    id: uuid(),
    value: 5,
}, {
    id: uuid(),
    value: 10,
}, {
    id: uuid(),
    value: 15,
}, {
    id: uuid(),
    value: 25,
}, {
    id: uuid(),
    value: 50,
}, {
    id: uuid(),
    value: 100,
}, {
    id: uuid(),
    value: 200,
}];
