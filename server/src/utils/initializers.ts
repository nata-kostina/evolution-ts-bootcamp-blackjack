import { GameState } from '../types/storeTypes.js';
import { initialDeck } from '../constants/cards.js';
import { SpecificID } from '../types/socketTypes.js';
import { PlayerInstance } from '../types/gameTypes.js';
import { initializeRoomController } from '../instances/RoomController.js';

export function initializeGameState({ roomID, playerID }: SpecificID): GameState {
  return {
    roomID,
    controller: initializeRoomController(roomID),
    organizer: playerID,
    hasStarted: false,
    deck: initialDeck,
    players: {},
    dealer: { cards: [], hasHoleCard: false, points: 0 },
    dealNum: 0,
  };
}

export function initializePlayer({ playerID, roomID, balance = 2000 }: SpecificID & {balance?: number}): PlayerInstance {
    return { playerID, roomID, balance, bet: 0, cards: [], points: 0, availableActions: [] };
}
