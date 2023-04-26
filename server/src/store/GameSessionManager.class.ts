/* eslint-disable @typescript-eslint/no-empty-function */
import {
  DealDealerCard,
  DealPlayerCard,
  IStore,
  Notification,
  PlayerInstance,
  RoomID,
  SpecificID,
} from '../types/index.js';
import { maxPlayersNum } from '../constants/index.js';
import { IResponseManager } from '../utils/responseManager.js';
import { successResponse } from '../utils/successResponse.js';
import { isError } from 'lodash';
import { CardsHandler } from '../utils/CardsHandler.js';

export class GameSessionManager {
  private _roomID: RoomID;
  private _players: Array<PlayerInstance> = [];
  private _isWaiting = false;
  private _isHandling = false;
  private readonly _respondManager: IResponseManager;
  private readonly _gameStore: IStore;

  constructor(roomID: RoomID, respondManager: IResponseManager, store: IStore) {
    this._roomID = roomID;
    this._respondManager = respondManager;
    this._gameStore = store;
  }

  public get roomID(): RoomID {
    return this._roomID;
  }

  public addPlayer(player: PlayerInstance): void {
    this._players.push(player);
  }

  public waitPlayers(socketID: string): Promise<void> {
    return new Promise((resolve) => {
      console.log(`${socketID} starts waiting`);
      this._isWaiting = true;
      let counter = 0;
      const step = 500;
      const interval = setInterval(() => {
        console.log(`Socket: ${socketID}: players num: ${this._players.length}`);
        counter += step;
        if (!this._isWaiting) {
          clearInterval(interval);
          return resolve();
        }
        if (this._players.length === maxPlayersNum) {
          console.log(`Room: ${this._roomID}: room is full`);
          this._isWaiting = false;
          clearInterval(interval);
          return resolve();
        }
        if (counter > 10000) {
          console.log(`Socket: ${socketID}: time out`);
          this._isWaiting = false;
          clearInterval(interval);
          return resolve();
        }
      }, step);
    });
  }
  public async notificate(notification: Notification): Promise<void> {
    if (this._isHandling) {
      return;
    } else {
      this._isHandling = true;
      await this._respondManager.respondWithDelay({
        roomID: this.roomID,
        event: 'notificate',
        response: [successResponse<Notification>(notification)],
      });
      this._isHandling = false;
    }
  }

  public async waitPlayersToPlaceBet(socketID: string): Promise<void> {
    return new Promise((resolve) => {
      console.log(`${socketID} starts waiting`);
      this._isWaiting = true;
      let counter = 0;
      const step = 500;
      const interval = setInterval(() => {
        counter += step;
        if (!this._isWaiting) {
          clearInterval(interval);
          return resolve();
        }

        const game = this._gameStore.getGame(this._roomID);
        if (Object.values(game.players).every((player) => player.bet > 0)) {
          this._isWaiting = false;
          clearInterval(interval);
          return resolve();
        }
        if (counter > 10000) {
          this._isWaiting = false;
          const failedToPlaceBet = Object.values(game.players).filter((player) => player.bet <= 0);
          failedToPlaceBet.forEach((player) =>
            this._gameStore.removePlayerFromGame({ roomID: this._roomID, playerID: player.playerID })
          );
          console.log(`Socket: ${socketID}: time out`);
          clearInterval(interval);
          return resolve();
        }
      }, step);
    });
  }

  public async dealCards(playerID: string): Promise<void> {
      console.log('player deals cards: ', { playerID, isHandling: this._isHandling});
    if (this._isHandling) {
      return;
    } else {
      this._isHandling = true;

      const { players } = this._gameStore.getGame(this._roomID);
      Object.values(players).forEach(async (player) => {
        await this.dealPlayerCard({ roomID: this._roomID, playerID: player.playerID });
      });
      await this.dealDealerCard(this._roomID);
      Object.values(players).forEach(async (player) => {
        await this.dealPlayerCard({ roomID: this._roomID, playerID: player.playerID });
      });
      await this.dealDealerHoleCard(this._roomID);
    //   this._isHandling = false;
    }
  }

  private async dealPlayerCard({ roomID, playerID }: SpecificID): Promise<void> {
    const player = this._gameStore.getPlayer({ playerID, roomID });
    // const mockCard = { id: '1faf', suit: Suit.Clubs, value: CardValue.TEN };
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    this._gameStore.updateHand({
      playerID: player.playerID,
      roomID,
      handID: player.activeHandID,
      payload: {
        cards: [...this._gameStore.getActiveHand({ roomID, playerID }).cards, card],
      },
    });

    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealPlayerCard',
      response: [
        successResponse<DealPlayerCard>({
          target: 'player',
          card: card,
          handID: player.activeHandID,
          points: this._gameStore.getScore({ roomID, playerID, handID: player.activeHandID }),
          playerID,
        }),
      ],
    });
  }
  private async dealDealerCard(roomID: RoomID): Promise<void> {
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    this._gameStore.updateDeck({ roomID, deck: updatedDeck });

    this._gameStore.updateDealer({
      roomID,
      payload: {
        hasHoleCard: false,
        cards: [card],
      },
    });
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealDealerCard',
      response: [
        successResponse<DealDealerCard>({
          target: 'dealer',
          card,
          points: this._gameStore.getDealer(roomID).points,
        }),
      ],
    });
  }

  private async dealDealerHoleCard(roomID: RoomID): Promise<void> {
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    this._gameStore.updateDealer({
      roomID,
      payload: {
        hasHoleCard: true,
        holeCard: card,
      },
    });
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealDealerCard',
      response: [
        successResponse<DealDealerCard>({
          target: 'dealer',
          card: { id: 'hole' },
          points: this._gameStore.getDealer(roomID).points,
        }),
      ],
    });
  }
}
