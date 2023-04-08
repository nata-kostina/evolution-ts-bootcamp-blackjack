/* eslint-disable @typescript-eslint/no-empty-function */
import randomstring from 'randomstring';
import { CardsHandler } from '../utils/CardsHandler.js';
import { UpdateDealerParams, UpdatePlayerParams } from '../types.js';
import { RoomID, Deck, PlayerInstance, GameSession, DealerInstance, PlayerID } from '../types/gameTypes.js';
import { GameState, State } from '../types/storeTypes.js';
import { SpecificID } from '../types/socketTypes.js';
import { io } from '../index.js';
import { maxPlayersNum } from '../constants/game.js';
import { initializeGameState } from './../utils/initializers.js';
import { RoomController } from '../instances/RoomController.js';

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

  public joinPlayerToGameState({ player, roomID }: { roomID: RoomID; player: PlayerInstance }): void {
    try {
      const game = this.store[roomID];
      if (game) {
        game.players[player.playerID] = player;
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

  public startGame(roomID: RoomID): void {
    const game = this.getGame(roomID);
    game.hasStarted = true;
  }

  public getPlayer({ roomID, playerID }: SpecificID): PlayerInstance {
    try {
      const game = this.getGame(roomID);
      const player = game.players[playerID];
      if (player) {
        return player;
      } else {
        throw new Error('There is no such player');
      }
    } catch (error) {
      console.log('Failed to get a player');
      throw new Error('Failed to get a player');
    }
  }

  public removeRoomFromStore(roomID: RoomID): void {
    const room = this.store[roomID];
    if (room) {
      delete this.store[roomID];
    }
  }

  public reassignOrginizer({ roomID, playerID: organizerID }: SpecificID): void {
    const game = this.getGame(roomID);
    const newOrganizer = Object.keys(game.players).find((p) => p !== organizerID);
    if (newOrganizer) {
      game.organizer = newOrganizer;
    } else {
      console.log('No one to reassign prganizer');
    }
  }

  public removePlayerFromGame({ roomID, playerID }: SpecificID): void {
    try {
      const game = this.getGame(roomID);
      if (game.players[playerID]) {
        delete game.players[playerID];
      } else {
        throw new Error('Player not found');
      }
    } catch (error) {
      throw new Error('Failed to remove player');
    }
  }

  public getSession(roomID: RoomID): GameSession {
    try {
      const game = this.getGame(roomID);
      const { hasHoleCard, cards: dealerCards, points } = game.dealer;
      const session: GameSession = {
        roomID: game.roomID,
        players: game.players,
        dealer: {
          hasHoleCard,
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
      const player = this.getPlayerInstance({ playerID, roomID });
      const updatedCards = payload.cards ? [...player.cards, ...payload.cards] : player.cards;
      const updatedPoints = CardsHandler.getPointsSum(updatedCards);
      const updatedActions = payload.availableActions ? payload.availableActions : [];
      const updatedPlayer: PlayerInstance = {
        ...player,
        ...payload,
        points: updatedPoints,
        cards: [...updatedCards],
        availableActions: updatedActions,
      };

      game.players[player.playerID] = updatedPlayer;
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
  public getController(roomID: RoomID): RoomController {
    const { controller } = this.getGame(roomID);
    return controller;
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

  public unholeCard(roomID: RoomID): void {
    try {
      const dealer = this.getDealer(roomID);
      const { holeCard, hasHoleCard } = dealer;
      if (hasHoleCard && holeCard) {
        this.updateDealer({
          roomID,
          payload: {
            cards: [holeCard],
            hasHoleCard: false,
            holeCard: undefined,
          },
        });
      } else {
        throw new Error('Dealer has no hole card.');
      }
    } catch (error) {
      throw new Error('Failed to unhole dealer card');
    }
  }
  public getPlayerInstance({ playerID, roomID }: SpecificID): PlayerInstance {
    const { players } = this.getSession(roomID);
    const playerKey = Object.keys(players).find((p) => p === playerID);
    if (playerKey) {
      return players[playerKey];
    }
    throw new Error('Failed to get current player');
  }
  public resetPlayer({ playerID, roomID }: SpecificID) {
    try {
      const game = this.getGame(roomID);
      const player = this.getPlayer({ playerID, roomID });
      const updatedPlayer: PlayerInstance = { ...player, cards: [], bet: 0, points: 0, insurance: 0 };

      game.players[player.playerID] = updatedPlayer;
    } catch (e: unknown) {
      throw new Error('Failed to reset player');
    }
  }
  public resetDealer(roomID: RoomID) {
    try {
      const game = this.getGame(roomID);
      const dealer = this.getDealer(roomID);
      const updatedDealer: DealerInstance = {
        ...dealer,
        cards: [],
        points: 0,
        hasHoleCard: false,
        holeCard: undefined,
      };
      game.dealer = updatedDealer;
    } catch (e: unknown) {
      throw new Error('Failed to reset dealer');
    }
  }
  public resetSession({ playerID, roomID }: SpecificID) {
    try {
      this.resetDealer(roomID);
      this.resetPlayer({ playerID, roomID });
    } catch (e) {
      throw new Error('Failed to reset session');
    }
  }
  public getResetSession({ playerID, roomID }: SpecificID): GameSession {
    try {
      const player = this.getPlayer({ playerID, roomID });
      const updatedPlayer: PlayerInstance = {
        ...player,
        cards: [],
        bet: 0,
        points: 0,
        insurance: 0,
        availableActions: [],
      };

      const session: GameSession = {
        roomID: playerID,
        players: {
          [playerID]: updatedPlayer,
        },
        dealer: {
          hasHoleCard: false,
          cards: [],
          points: 0,
        },
      };
      return session;
    } catch (e) {
      throw new Error('Failed to get reset session');
    }
  }

  public createNewRoom(playerID: PlayerID): RoomID {
    const roomID = 'Room_id_' + randomstring.generate();
    const gameState = initializeGameState({ roomID, playerID });
    gameState.organizer = playerID;
    this.store[roomID] = gameState;
    return roomID;
  }

  public getAvailableRoomID(): RoomID | null {
    const rooms = io.sockets.adapter.rooms;
    for (const [id, participants] of rooms) {
      if (id.startsWith('Room_id_') && participants.size < maxPlayersNum) {
        const game = this.getGame(id);
        if (!game.hasStarted) {
          return id;
        }
      }
    }
    return null;
  }
}
