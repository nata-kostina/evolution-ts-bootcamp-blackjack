import { v4 } from "uuid";
import { Suit, CardValue, Card, Deck } from "../types/gameTypes.js";

const suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades] as const;
const values = Object.values(CardValue);

const deck_52 = values.map((value) => suits.map((suit) => ({ value, suit, id: v4() } as Card)));
const flattenedDeck_52: Deck = deck_52.flat(1);

export const initialDeck: Deck = flattenedDeck_52
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52);

export const PointsMap: Record<CardValue, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 10,
  Q: 10,
  K: 10,
  A: 11,
};

export const TWENTY_ONE = 21;

export const TenSet = new Set([CardValue.TEN, CardValue.J, CardValue.Q, CardValue.K]);