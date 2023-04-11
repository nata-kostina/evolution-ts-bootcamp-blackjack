import { string, number, array, object, boolean } from "yup";
import { Action, CardValue, Suit } from "../../types/game.types";
import { NotificationVariant } from "../../types/notification.types";

export const playerIDSchema = string<Action>().required();

const cardSchema = object().shape({
    value: string<CardValue>().required(),
    suit: string<Suit>().required(),
    id: string().required(),
});

const actionsSchema = string<Action>().required();

export const playerSchema = object().shape({
    playerID: string().required(),
    roomID: string().required(),
    cards: array().of(cardSchema).required(),
    bet: number().required().min(0),
    balance: number().required(),
    points: number().required().min(0),
    insurance: number().required().min(0),
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
});

export const unholedCardSchema = object().shape({
    target: string<"dealer">().required(),
    card: cardSchema,
    points: number().required().min(0),
});
