import { store } from '../index.js';
import { SpecificID } from '../types/socketTypes.js';
import { Card, CardValue } from '../types/gameTypes.js';
import { TenSet, PointsMap, TWENTY_ONE } from '../constants/cards.js';

type Handler = {
  takeCardFromDeck: (deck: Card[]) => { card: Card; updatedDeck: Card[] };
  isBlackjack: (id: SpecificID) => boolean;
  getPointsSum: (cards: Card[]) => number;
};

export const CardsHandler: Handler = {
  takeCardFromDeck: (deck) => {
    const randomIdx = Math.floor(Math.random() * deck.length);
    const card = deck[randomIdx];
    deck.splice(randomIdx, 1);
    return { card, updatedDeck: deck };
  },

  isBlackjack: ({ playerID, roomID }: SpecificID) => {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const { cards } = player;
      if (cards.length === 2) {
        const [first, second] = cards;
        if (
          (first.value === CardValue.ACE && TenSet.has(second.value)) ||
          (second.value === CardValue.ACE && TenSet.has(first.value))
        ) {
          return true;
        }
      }
      return false;
    } catch (error) {
      throw new Error('Failed to check for blackjack');
    }
  },

  getPointsSum(cards: Card[]): number {
    return cards.reduce((sum, card) => {
      let point = PointsMap[card.value];
      // special check for Ace
      if (card.value === CardValue.ACE && sum > TWENTY_ONE) {
        point = 1;
      }  
      sum += point;
      return sum;
    }, 0);
  }
};
