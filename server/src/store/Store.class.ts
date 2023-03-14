/* eslint-disable @typescript-eslint/no-empty-function */
import { CardsHandler } from '../utils/CardsHandler.js';
import {  UpdateDealerParams, UpdatePlayerParams } from '../types.js';
import { RoomID, Deck, PlayerInstance, GameSession, DealerInstance } from '../types/gameTypes.js';
import { GameState, State } from '../types/storeTypes.js';
import { SpecificID } from '../types/socketTypes.js';

export class Store {
  private store: State;
  constructor() {
    this.store = {};
  }

  public addGameState(roomID: RoomID, game: GameState): void {
    this.store[roomID] = game;
  }
  public updateDeck({ roomID, deck }: { roomID: RoomID; deck: Deck }): void {
    try {
      const game = this.store[roomID];
      if (game) {
        game.deck = [...deck];
      } else {
        throw new Error('No such game');
      }
    } catch (error) {
      console.log('Failed to join player to a game');
    }
  }

  public joinPlayerToGameState(roomID: RoomID, player: PlayerInstance): void {
    try {
      const game = this.store[roomID];
      if (game) {
        game.players.push(player);
      } else {
        throw new Error('No such game');
      }
    } catch (error) {
      console.log('Failed to join player to a game');
    }
  }

  public getGame(roomID: RoomID): GameState {
    try {
      const game = this.store[roomID];
      if (game) {
        return game;
      } else {
        throw new Error('There is no such room');
      }
    } catch (error) {
      console.log('Failed to get a game');
      throw new Error('Failed to get a game');
    }
  }

  public getPlayer({ roomID, playerID }: SpecificID): PlayerInstance {
    try {
      const game = this.getGame(roomID);
      const player = game.players.find((player) => player.playerID === playerID);
      if (player) {
        return player;
      } else {
        console.log('There is no such player');
        throw new Error('There is no such player');
      }
    } catch (error) {
      console.log('Failed to get a player');
      throw new Error('Failed to get a player');
    }
  }

  public getSession({ playerID, roomID }: SpecificID): GameSession {
    try {
      const game = this.getGame(roomID);
      const player = this.getPlayer({ playerID, roomID });
      const { hasHole, cards: dealerCards, points } = game.dealer;
      const session: GameSession = {
        roomID: game.roomID,
        player,
        dealer: {
          hasHole,
          cards: dealerCards,
          points,
        },
      };
      return session;
    } catch (error) {
      throw new Error('Failed to prepare response for client');
    }
  }
  public getDeck(roomID: RoomID): Deck {
    try {
      const game = this.getGame(roomID);
      return [...game.deck];
    } catch (error) {
      throw new Error('Failed to prepare response for client');
    }
  }

  public updatePlayer({ playerID, roomID, payload }: UpdatePlayerParams) {
    try {
      const game = this.getGame(roomID);
      const player = this.getPlayer({ playerID, roomID });
      const idx = this.getPlayerIndex({ playerID, roomID });
      const updatedCards = payload.cards ? [...player.cards, ...payload.cards] : player.cards;
      const updatedPoints = CardsHandler.getPointsSum(updatedCards);
      const updatedPlayer = { ...player, ...payload, points: updatedPoints, cards: [...updatedCards] };

      game.players[idx] = updatedPlayer;
    } catch (e: unknown) {
      throw new Error('Player updation failed');
    }
  }

  public getDealer(roomID: RoomID): DealerInstance {
    const game = this.getGame(roomID);
    const dealer = game.dealer;
    if (dealer) {
      return dealer;
    } else {
      console.log('There is no such dealer');
      throw new Error('There is no such dealer');
    }
  }

  public updateDealer({ roomID, payload }: UpdateDealerParams) {
    try {
      const game = this.getGame(roomID);
      const dealer = this.getDealer(roomID);
      const updatedCards = payload.cards ? [...dealer.cards, ...payload.cards] : dealer.cards;
      const updatedPoints = CardsHandler.getPointsSum(updatedCards);
      const updatedDealer = { ...dealer, ...payload, cards: updatedCards, points: updatedPoints };
      game.dealer = updatedDealer;
    } catch (e: unknown) {
      throw new Error('Player updation failed');
    }
  }

  public getPlayerIndex({ playerID, roomID }: SpecificID): number {
    const game = this.getGame(roomID);
    const index = game.players.findIndex((p) => p.playerID === playerID);
    if (index < 0) {
      throw new Error('Player not found');
    }
    return index;
  }

  public unholeCard(roomID: RoomID) {
    try {
      const dealer = this.getDealer(roomID);
      const { cards, holeCard, hasHole } = dealer;
      if (hasHole && holeCard) {
        const updatedCards = [...cards, holeCard];
        const updatedPoints = CardsHandler.getPointsSum(updatedCards);
        this.updateDealer({
          roomID,
          payload: {
            cards: updatedCards,
            hasHole: false,
            holeCard: undefined,
            points: updatedPoints,
          },
        });
      } else {
        throw new Error('Dealer has no hole card.');
      }
    } catch (error) {
      throw new Error('Failed to unhole dealer card');
    }
  }
}
