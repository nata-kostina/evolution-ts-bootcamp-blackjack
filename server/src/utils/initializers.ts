import { GameState } from '../types/storeTypes.js';
import { initialDeck } from '../constants/cards.js';
import { SpecificID } from '../types/socketTypes.js';
import { RoomID, PlayerInstance } from '../types/gameTypes.js';

export function initializeGameState(roomID: RoomID): GameState {
  return {
    roomID,
    deck: initialDeck,
    players: [],
    dealer: { cards: [], hasHole: false, points: 0 },
    dealNum: 0,
  };
}

export function initializePlayer({ playerID, roomID }: SpecificID): PlayerInstance {
  return { playerID, roomID, balance: 2000, bet: 0, cards: [], points: 0 };
}
