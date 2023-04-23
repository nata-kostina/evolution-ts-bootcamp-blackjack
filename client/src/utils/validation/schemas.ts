import { string, number, array, object, boolean } from "yup";
import { Action, CardValue, GameResult, Suit } from "../../types/game.types";
import { NotificationVariant } from "../../types/notification.types";

export const playerIDSchema = string<Action>().required();

const cardSchema = object().shape({
    value: string<CardValue>().required(),
    suit: string<Suit>().required(),
    id: string().required(),
});

const actionsSchema = string<Action>().required();

export const handSchema = object().shape({
    handID: string().required(),
    parentID: string().required(),
    cards: array().of(cardSchema).required(),
    bet: number().required(),
    points: array().of(number().required()).required(),
});

export const playerSchema = object().shape({
    playerID: string().required(),
    roomID: string().required(),
    bet: number().required().min(0),
    balance: number().required(),
    insurance: number().required().min(0),
    hands: array().of(handSchema).required(),
    activeHandID: string().defined().test(
        "my test",
        "error: name is not a string",
        (text) => {
            if (typeof text === "string") {
                return true;
            }
            return false;
        }),
    availableActions: array().of(actionsSchema).required(),
});

const dealerSchema = object().shape({
    cards: array().of(cardSchema).required(),
    points: number().required().min(0),
    hasHoleCard: boolean().required(),
});

export const gameSessionSchema = object().shape({
    roomID: string().required(),
    players: object({}).required(),
    dealer: dealerSchema,
});

export const notificationSchema = object().shape({
    variant: string<NotificationVariant>().required(),
    text: string().required(),
});

export const newCardSchema = object().shape({
    target: string<"dealer" | "player">().required(),
    card: object().shape({
        value: string<CardValue>(),
        suit: string<Suit>(),
        id: string().required(),
    }),
    points: number().required().min(0),
    handID: string(),
});

export const unholedCardSchema = object().shape({
    target: string<"dealer">().required(),
    card: cardSchema,
    points: number().required().min(0),
});

export const handIDSchema = string().required();

export const gameResultSchema = string<GameResult>().required();
