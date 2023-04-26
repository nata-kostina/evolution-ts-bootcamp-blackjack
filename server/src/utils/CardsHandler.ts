import { ELEVEN, NINE, PointsMap, TEN, TenSet, TWENTY_ONE } from '../constants/index.js';
import { Card, CardValue, IStore, RoomID, SpecificID } from '../types/index.js';

type Handler = {
  takeCardFromDeck: (deck: Card[]) => { card: Card; updatedDeck: Card[] };
  isBlackjack: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  canDouble: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  canSplit: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  canPlaceInsurance: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => boolean;
  getPlayerPoints: (cards: Card[]) => Array<number>;
  getDealerPoints: (cards: Card[]) => number;
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
      throw new Error(`Player ${playerID}: Failed to check for blackjack`);
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
      return activeHand.cards.length === 2;
    } catch (error: unknown) {
      throw new Error(`Player ${playerID}: Failed to check for double`);
    }
  },
  canSplit: ({ playerID, roomID, store }: SpecificID & { store: IStore }) => {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const activeHand = store.getActiveHand({ roomID, playerID });
      if (activeHand.bet > player.balance) return false;
      if (player.hands.length >= 2) return false;
      if (activeHand.cards.length === 2) {
        const [first, second] = activeHand.cards;
        return first.value === second.value || (TenSet.has(first.value) && TenSet.has(second.value));
      }
      return false;
    } catch (error) {
      throw new Error(`Player ${playerID}: Failed to check for split`);
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
      throw new Error(`Failed to check for place insurance`);
    }
  },

  getPlayerPoints(cards: Card[]): Array<number> {
      if (cards.length === 2) {
        const [first, second] = cards;
        if (
          (first.value === CardValue.ACE && TenSet.has(second.value)) ||
          (second.value === CardValue.ACE && TenSet.has(first.value))
        ) {
          return [TWENTY_ONE];
        }
      }
    const aces = cards.filter((card) => card.value === CardValue.ACE);
    if (aces.length > 0) {
      const acesSums = [aces.length, PointsMap[CardValue.ACE] + aces.length - 1];

      const nonAces = cards.filter((card) => card.value !== CardValue.ACE);
      const nonAcesSum = nonAces.reduce((sum, card) => {
        sum += PointsMap[card.value];
        return sum;
      }, 0);

      const minorSum = nonAcesSum + acesSums[0];
      const majorSum = nonAcesSum + acesSums[1];

      if (majorSum > TWENTY_ONE) {
        return [minorSum];
      } else {
        return [minorSum, majorSum];
      }
    } else {
      const pointsSum = cards.reduce((sum, card) => {
        sum += PointsMap[card.value];
        return sum;
      }, 0);
      return [pointsSum];
    }
  },

  getDealerPoints(cards: Card[]): number {
    const aces = cards.filter((card) => card.value === CardValue.ACE);
    if (aces.length > 0) {
        const acesSums = [aces.length, PointsMap[CardValue.ACE] + aces.length - 1];
      const nonAces = cards.filter((card) => card.value !== CardValue.ACE);
      const nonAcesSum = nonAces.reduce((sum, card) => {
        sum += PointsMap[card.value];
        return sum;
      }, 0);

      const minorSum = nonAcesSum + acesSums[0];
      const majorSum = nonAcesSum + acesSums[1];

      if (majorSum > TWENTY_ONE) {
        return minorSum;
      } else {
        return majorSum;
      }
    }
    return cards.reduce((sum, card) => {
      sum += PointsMap[card.value];
      return sum;
    }, 0);
  },
};
