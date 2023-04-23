import randomstring from 'randomstring';
import {
  DealerInstance,
  Deck,
  GameSession,
  GameState,
  Hand,
  IStore,
  PlayerID,
  PlayerInstance,
  RoomID,
  SpecificID,
  State,
  UpdateDealerParams,
  UpdateHandParams,
  UpdatePlayerParams,
} from '../types/index.js';
import { initializeGameState } from '../utils/initializers.js';
import { CardsHandler } from '../utils/CardsHandler.js';
import { initializeHand } from './../utils/initializers.js';

class Store implements IStore {
  private store: State;

  constructor() {
    this.store = {};
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
      throw new Error('Failed to update the deck');
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
      throw new Error('Failed to join player to a game');
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
      throw new Error('Failed to get a game');
    }
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
      throw new Error(`Player ${playerID}: Failed to get a player`);
    }
  }

  public removeRoomFromStore(roomID: RoomID): void {
    const room = this.store[roomID];
    if (room) {
      delete this.store[roomID];
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
      throw new Error(`Player ${playerID}: Failed to remove player`);
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
      throw new Error('Failed to get game');
    }
  }

  public getActiveHand({ roomID, playerID }: SpecificID): Hand {
    try {
      const game = this.getGame(roomID);
      const player = game.players[playerID];
      if (player) {
        const activeHand = player.hands.find((hand) => hand.handID === player.activeHandID);
        if (activeHand) {
          return activeHand;
        } else {
          throw new Error('There is no active hand');
        }
      } else {
        throw new Error('There is no such player');
      }
    } catch (error) {
      throw new Error(`Player ${playerID}: Failed to get an active hand`);
    }
  }

  public updatePlayer({ playerID, roomID, payload }: UpdatePlayerParams): void {
    try {
      const game = this.getGame(roomID);
      const player = this.getPlayer({ playerID, roomID });
      const updatedPlayer: PlayerInstance = {
        ...player,
        ...payload,
      };

      game.players[player.playerID] = updatedPlayer;
    } catch (e: unknown) {
      throw new Error(`Player ${playerID}: Failed to update player`);
    }
  }

  public updateHand({ playerID, roomID, handID, payload }: UpdateHandParams): void {
    try {
      const hand = this.getHand({ playerID, roomID, handID });
      const player = this.getPlayer({ playerID, roomID });
      const updatedPoints = payload.cards ? CardsHandler.getPointsSum(payload.cards) : hand.points;
      const updatedHand: Hand = {
        ...hand,
        ...payload,
        points: updatedPoints,
      };

      const updatedHands = player.hands.map((h) => {
        if (h.handID === handID) {
          return updatedHand;
        } else {
          return h;
        }
      });

      this.updatePlayer({ roomID, playerID, payload: { hands: updatedHands } });
    } catch (e: unknown) {
      throw new Error(`Player ${playerID}: Failed to update hand`);
    }
  }

  public getScore({ roomID, playerID, handID }: SpecificID & { handID: string }): Array<number> {
    try {
      const hand = this.getHand({ playerID, roomID, handID });
      return hand.points;
    } catch (e: unknown) {
      throw new Error(`Player ${playerID}: Failed to get score`);
    }
  }

  public getHand({ roomID, playerID, handID }: SpecificID & { handID: string }): Hand {
    try {
      const game = this.getGame(roomID);
      const player = game.players[playerID];
      if (player) {
        const hand = player.hands.find((h) => h.handID === handID);
        if (hand) {
          return hand;
        } else {
          throw new Error('There is no active hand');
        }
      } else {
        throw new Error('There is no such player');
      }
    } catch (error) {
      throw new Error(`Player ${playerID}: Failed to get hand`);
    }
  }

  public getDealer(roomID: RoomID): DealerInstance {
    const game = this.getGame(roomID);
    const dealer = game.dealer;
    if (dealer) {
      return dealer;
    } else {
      throw new Error('Failed to get the dealer');
    }
  }

  public updateDealer({ roomID, payload }: UpdateDealerParams): void {
    try {
      const game = this.getGame(roomID);
      const dealer = this.getDealer(roomID);
      const updatedCards = payload.cards ? [...dealer.cards, ...payload.cards] : dealer.cards;
      const updatedPoints = CardsHandler.getDealerPoints(updatedCards);
      const updatedDealer = { ...dealer, ...payload, cards: updatedCards, points: updatedPoints };
      game.dealer = updatedDealer;
    } catch (e: unknown) {
      throw new Error('Failed to update dealer');
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

  public resetPlayer({ playerID, roomID }: SpecificID): void {
    try {
      const game = this.getGame(roomID);
      const player = this.getPlayer({ playerID, roomID });
      const updatedPlayer: PlayerInstance = {
        ...player,
        hands: [],
        bet: 0,
        insurance: 0,
        activeHandID: "",
        availableActions: []
      };

      game.players[player.playerID] = updatedPlayer;
    } catch (e: unknown) {
      throw new Error(`Player ${playerID}: Failed to reset player`);
    }
  }

  public resetDealer(roomID: RoomID): void {
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
  public resetSession({ playerID, roomID }: SpecificID): void {
    try {
      this.resetDealer(roomID);
      this.resetPlayer({ playerID, roomID });
    } catch (e) {
      throw new Error(`Player ${playerID}: Failed to reset session`);
    }
  }

  public getResetSession({ playerID, roomID }: SpecificID): GameSession {
    try {
      const player = this.getPlayer({ playerID, roomID });
      const activeHand = initializeHand(playerID);

      const updatedPlayer: PlayerInstance = {
        ...player,
        hands: [activeHand],
        bet: 0,
        insurance: 0,
        activeHandID: activeHand.handID,
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
      throw new Error(`Player ${playerID}: Failed to get reset session`);
    }
  }

  public reassignActiveHand({ roomID, playerID }: SpecificID): void {
    try {
      const player = this.getPlayer({ roomID, playerID });
      const newActiveHand = player.hands.find((hand) => hand.parentID === player.activeHandID);
      if (newActiveHand) {
        this.updatePlayer({
          roomID,
          playerID,
          payload: {
            activeHandID: newActiveHand.handID,
          },
        });
      }
    } catch (error) {
      throw new Error(`Player ${playerID}: Failed to get reassign active hand`);
    }
  }

  public removeHand({ roomID, playerID, handID }: SpecificID & { handID: string }): void {
    try {
        const { hands } = this.getPlayer({ roomID, playerID });
        const updatedHands = hands.filter((hand) => hand.handID !== handID);
      this.updatePlayer({ roomID, playerID, payload: { hands: updatedHands } });
    } catch (error) {
      throw new Error(`Player ${playerID}: Failed to remove hand`);
    }
  }

  public createNewRoom(playerID: PlayerID): RoomID {
    const roomID = 'Room_id_' + randomstring.generate();
    const gameState = initializeGameState({ roomID, playerID });
    gameState.organizer = playerID;
    this.store[roomID] = gameState;
    return roomID;
  }
}

export const GameStore = new Store();
