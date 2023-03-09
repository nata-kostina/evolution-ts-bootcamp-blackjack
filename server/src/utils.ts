import { deck } from './constants.js';
import { GameSession } from './types.js';

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function createNewGameSession(roomID: string): GameSession {
  return {
    roomID,
    deck,
    players: [],
  };
}
