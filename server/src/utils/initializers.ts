import { initialDeck } from '../constants/index.js';
import { GameState, PlayerInstance, SpecificID } from '../types/index.js';

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

export function initializePlayer({ playerID, roomID, balance = 2000 }: SpecificID & {balance?: number}): PlayerInstance {
    return { playerID, roomID, balance, bet: 0, cards: [], points: 0, availableActions: [], insurance: 0 };
}
