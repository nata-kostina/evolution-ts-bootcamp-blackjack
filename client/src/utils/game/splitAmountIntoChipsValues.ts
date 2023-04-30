import { chipsValues } from "../../constants/game.constants";

type Result = Array<{ chipValue: number; amount: number; }>;

export const splitAmountIntoChipsValues = (amount: number): Result => {
    let currentAmount = amount;
    chipsValues.sort((a, b) => b - a);
    return chipsValues.reduce<Result>((acc, value) => {
        const quotient = Math.floor(currentAmount / value);
        currentAmount %= value;
        acc.push({ chipValue: value, amount: quotient });
        return acc;
    }, []);
};
