import { store } from '../index.js';
import { SpecificID } from '../types/socketTypes.js';
import { Card, CardValue } from '../types/gameTypes.js';
import { TenSet, PointsMap, TWENTY_ONE, TEN, NINE } from '../constants/cards.js';
import { ELEVEN } from './../constants/cards.js';

type Handler = {
  takeCardFromDeck: (deck: Card[]) => { card: Card; updatedDeck: Card[] };
  isBlackjack: (id: SpecificID) => boolean;
  canDouble: (id: SpecificID) => boolean;
  canSplit: (id: SpecificID) => boolean;
  canPlaceInsurance: ({ playerID, roomID }: SpecificID) => boolean;
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
      console.log('PLAYER CARDS: ', cards);
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
  canDouble: ({ playerID, roomID }: SpecificID) => {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const { cards: playerCards, points } = player;

      if (playerCards.length === 2) {
        return points === NINE || points === TEN || points === ELEVEN;
      }
      return false;
    } catch (error: unknown) {
      throw new Error('Failed to check for double');
    }
  },
  canSplit: ({ playerID, roomID }: SpecificID) => {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const { cards } = player;
      if (cards.length === 2) {
        const [first, second] = cards;
        return first.value === first.value || (TenSet.has(first.value) && TenSet.has(second.value));
      }
      return false;
    } catch (error) {
      throw new Error('Failed to check for double');
    }
  },

  canPlaceInsurance: ({ playerID, roomID }: SpecificID) => {
    try {
      const { cards: dealerCards } = store.getDealer(roomID);
      if (dealerCards.length !== 1) {
        throw new Error("The number of dealer's must be one");
      }
      const [card] = dealerCards;
      if (card.value === CardValue.ACE) {
        return true;
      }
      return false;
    } catch (error) {
        throw new Error('Failed to check for place insurance');
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
  },
};
