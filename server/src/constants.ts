import { Card, Deck } from './types';

const suits = ['spades', 'diamonds', 'clubs', 'hearts'] as const;
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;

const deck_52 = values.map((value) => suits.map((suit) => [value, suit] as Card));
const flattenedDeck_52: Deck = deck_52.flat(1);

export const deck: Deck = flattenedDeck_52
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52)
  .concat(flattenedDeck_52);
