import { initialDeck } from '../constants/index.js';
import { GameState, Hand, PlayerInstance, SpecificID } from '../types/index.js';
import { v4 } from 'uuid';

export function initializeGameState({ roomID, playerID }: SpecificID): GameState {
  return {
    roomID,
    organizer: playerID,
    hasStarted: false,
    deck: initialDeck,
    players: {},
    dealer: { cards: [], hasHoleCard: false, points: 0 },
    dealNum: 0,
  };
}

export function initializePlayer({
  playerID,
  roomID,
  balance = 2000,
}: SpecificID & { balance?: number }): PlayerInstance {
    const activeHand = initializeHand(playerID);
  return {
    playerID,
    roomID,
    balance,
    bet: 0,
    insurance: 0,
    hands: [activeHand],
    activeHandID: activeHand.handID,
    availableActions: [],
  };
}

export function initializeHand(parentID: string): Hand {
  return {
    bet: 0,
    cards: [],
    handID: v4(),
    parentID,
    points: 0,
    isStanding: false,
  };
}
