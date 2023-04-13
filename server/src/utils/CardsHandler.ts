import { ELEVEN, NINE, PointsMap, TEN, TenSet, TWENTY_ONE } from '../constants/index.js';
import { Card, CardValue, IStore, RoomID, SpecificID } from '../types/index.js';

type Handler = {
  takeCardFromDeck: (deck: Card[]) => { card: Card; updatedDeck: Card[] };
  isBlackjack: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  canDouble: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  canSplit: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  canPlaceInsurance: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  getPointsSum: (cards: Card[]) => number;
};

export const CardsHandler: Handler = {
  takeCardFromDeck: (deck) => {
    const randomIdx = Math.floor(Math.random() * deck.length);
    const card = deck[randomIdx];
    deck.splice(randomIdx, 1);
    return { card, updatedDeck: deck };
  },

  isBlackjack: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const activeHand = store.getActiveHand({ roomID, playerID });
      if (activeHand.cards.length === 2) {
        const [first, second] = activeHand.cards;
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
  canDouble: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => {
    try {
      const { hands, balance, bet } = store.getPlayer({ playerID, roomID });
      if (hands.length !== 1) return false;
      if (bet * 2 > balance) {
        return false;
      }
      const activeHand = hands[0];
      if (activeHand.cards.length === 2) {
        return activeHand.points === NINE || activeHand.points === TEN || activeHand.points === ELEVEN;
      }
      return false;
    } catch (error: unknown) {
      throw new Error('Failed to check for double');
    }
  },
  canSplit: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const activeHand = store.getActiveHand({ roomID, playerID });
      if (activeHand.bet * 2 > player.balance) return false;
      if (player.hands.length >= 4) return false;
      if (activeHand.cards.length === 2) {
        const [first, second] = activeHand.cards;
        return first.value === second.value || (TenSet.has(first.value) && TenSet.has(second.value));
      }
      return false;
    } catch (error) {
      throw new Error('Failed to check for double');
    }
  },

  canPlaceInsurance: ({ roomID, store }: { roomID: RoomID; store: IStore }) => {
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
      const point = PointsMap[card.value];
      sum += point;
      // special check for Ace
      if (card.value === CardValue.ACE && sum > TWENTY_ONE) {
        sum = sum - point + 1;
      }
      return sum;
    }, 0);
  },
};
