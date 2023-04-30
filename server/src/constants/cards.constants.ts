import { v4 } from "uuid";
import { Suit, CardValue, Card, Deck } from "../types/index.js";

const suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades] as const;
const values = Object.values(CardValue);

const deck = values.map((value) => suits.map((suit) => ({ value, suit, id: v4() } as Card)));
const flattenedDeck: Deck = deck.flat(1);

export const initialDeck: Deck = flattenedDeck
    .concat(flattenedDeck)
    .concat(flattenedDeck)
    .concat(flattenedDeck)
    .concat(flattenedDeck)
    .concat(flattenedDeck);

export const PointsMap: Record<CardValue, number> = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 10,
    Q: 10,
    K: 10,
    A: 11,
};

export const TWENTY_ONE = 21;
export const SEVENTEEN = 17;
export const NINE = 9;
export const TEN = 10;
export const ELEVEN = 11;

export const TenSet = new Set([CardValue.TEN, CardValue.J, CardValue.Q, CardValue.K]);
export const MinorSet = new Set([
    CardValue.TWO,
    CardValue.THREE,
    CardValue.FOUR,
    CardValue.FIVE,
    CardValue.SIX,
    CardValue.SEVEN,
    CardValue.EIGHT,
    CardValue.NINE,
]);
