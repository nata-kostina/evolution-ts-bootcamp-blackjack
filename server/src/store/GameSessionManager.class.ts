/* eslint-disable @typescript-eslint/no-empty-function */
import {
  Action,
  CardValue,
  ClientToServerEvents,
  DealDealerCard,
  DealPlayerCard,
  GameResult,
  GameSession,
  IPlayersStore,
  IStore,
  Notification,
  PlayerID,
  PlayerInstance,
  ReassignActiveHand,
  RoomID,
  ServerToClientEvents,
  SpecificID,
  Suit,
  WinCoefficient,
} from '../types/index.js';
import {
  BlackjackNotification,
  maxPlayersNum,
  MinorSet,
  PlaceBetNotification,
  TakeMoneyNotification,
  TenSet,
} from '../constants/index.js';
import { IResponseManager } from '../utils/responseManager.js';
import { successResponse } from '../utils/successResponse.js';
import { CardsHandler } from '../utils/CardsHandler.js';
import ld from 'lodash';
import { Server, Socket } from 'socket.io';
import { generatePlayerID } from './../utils/generatePlayerID.js';
import { initializeHand } from '../utils/initializers.js';
import { isError } from '../utils/isError.js';

export class GameSessionManager {
  private _roomID: RoomID;
  private readonly _respondManager: IResponseManager;
  private readonly _gameStore: IStore;
  private readonly _io: Server<ClientToServerEvents, ServerToClientEvents>;
  private readonly playerSocketMap: Array<{ playerID: PlayerID; socket: Socket }> = [];
  private readonly _playersStore: IPlayersStore;
  constructor(
    roomID: RoomID,
    respondManager: IResponseManager,
    store: IStore,
    playersStore: IPlayersStore,
    io: Server<ClientToServerEvents, ServerToClientEvents>
  ) {
    this._roomID = roomID;
    this._respondManager = respondManager;
    this._gameStore = store;
    this._playersStore = playersStore;
    this._io = io;
    this.waitPlayers();
  }

  public get roomID(): RoomID {
    return this._roomID;
  }

  public addPlayer(value: { playerID: PlayerID; socket: Socket }): void {
    this.playerSocketMap.push(value);
  }

  public async waitPlayers(): Promise<void> {
    const pendingPlayers = () =>
      new Promise<void>((resolve) => {
        let counter = 0;
        const step = 500;

        const interval = setInterval(() => {
          const game = this._gameStore.getGame(this._roomID);

          counter += step;
          const playersNum = Object.keys(game.players).length;
          if (playersNum === maxPlayersNum || counter > 10000) {
            clearInterval(interval);
            return resolve();
          }
        }, step);
      });
    await pendingPlayers();

    const players = this._io.sockets.adapter.rooms.get(this._roomID);
    if (!players) return;

    const pendingResponse = Array.from(players).map((socketID) => {
      const playerID = this.playerSocketMap.find((item) => item.socket.id === socketID)?.playerID || generatePlayerID();
      return this._respondManager.respondWithDelay({
        roomID: socketID,
        event: 'initGame',
        response: [successResponse({ game: ld.cloneDeep(this._gameStore.getSession(this._roomID)), playerID })],
      });
    });
    Promise.all(pendingResponse).then(() => {
      this.notificate({ notification: PlaceBetNotification, target: this._roomID });
      this.waitPlayersToPlaceBet();
    });
  }
  public async notificate({ notification, target }: { notification: Notification; target: string }): Promise<void> {
    await this._respondManager.respondWithDelay({
      roomID: target,
      event: 'notificate',
      response: [successResponse<Notification>(notification)],
    });
  }

  public async waitPlayersToPlaceBet(): Promise<void> {
    return new Promise((resolve) => {
      let counter = 0;
      const step = 500;
      const interval = setInterval(() => {
        counter += step;

        const game = this._gameStore.getGame(this._roomID);

        if (Object.values(game.players).every((player) => player.bet > 0) || counter > 10000) {
          const failedToPlaceBet = Object.values(game.players).filter((player) => player.bet <= 0);
          failedToPlaceBet.forEach((player) => {
            this._gameStore.removePlayerFromGame({ roomID: this._roomID, playerID: player.playerID });
            const socket = this.playerSocketMap.find((item) => item.playerID === player.playerID)?.socket;
            socket?.leave(this._roomID);
          });

          this.startPlay();

          clearInterval(interval);

          return resolve();
        }
      }, step);
    });
  }

  public async dealCards(): Promise<void> {
    const { players } = this._gameStore.getGame(this._roomID);
    Object.values(players).forEach(async (player) => {
      await this.dealPlayerCard({ roomID: this._roomID, playerID: player.playerID });
    });
    await this.dealDealerCard(this._roomID);
    Object.values(players).forEach(async (player) => {
      await this.dealPlayerCard2({ roomID: this._roomID, playerID: player.playerID });
    });
    await this.dealDealerHoleCard(this._roomID);
  }

  private async dealPlayerCard({ roomID, playerID }: SpecificID): Promise<void> {
    const player = this._gameStore.getPlayer({ playerID, roomID });
    const mockCard = { id: '1faf', suit: Suit.Clubs, value: CardValue.ACE };
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    this._gameStore.updateHand({
      playerID: player.playerID,
      roomID,
      handID: player.activeHandID,
      payload: {
        cards: [...this._gameStore.getActiveHand({ roomID, playerID }).cards, mockCard],
      },
    });

    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealPlayerCard',
      response: [
        successResponse<DealPlayerCard>({
          target: 'player',
          card: mockCard,
          handID: player.activeHandID,
          points: this._gameStore.getScore({ roomID, playerID, handID: player.activeHandID }),
          playerID,
        }),
      ],
    });
  }
  private async dealPlayerCard2({ roomID, playerID }: SpecificID): Promise<void> {
    const player = this._gameStore.getPlayer({ playerID, roomID });
    const mockCard = { id: '1faf', suit: Suit.Clubs, value: CardValue.TEN };
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    this._gameStore.updateHand({
      playerID: player.playerID,
      roomID,
      handID: player.activeHandID,
      payload: {
        cards: [...this._gameStore.getActiveHand({ roomID, playerID }).cards, mockCard],
      },
    });

    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealPlayerCard',
      response: [
        successResponse<DealPlayerCard>({
          target: 'player',
          card: mockCard,
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
    const mockCard = { id: '1faf', suit: Suit.Clubs, value: CardValue.EIGHT };

    this._gameStore.updateDealer({
      roomID,
      payload: {
        hasHoleCard: false,
        cards: [mockCard],
      },
    });
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealDealerCard',
      response: [
        successResponse<DealDealerCard>({
          target: 'dealer',
          card: mockCard,
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

  private async startPlay(): Promise<void> {
    try {
      await this.dealCards();

      const { players } = this._gameStore.getGame(this._roomID);

      //   (async function () {
      for await (const player of Object.values(players)) {
        const isBlackjack = CardsHandler.isBlackjack({
          roomID: this._roomID,
          playerID: player.playerID,
          store: this._gameStore,
        });
        if (isBlackjack) {
          await this.handleBlackjack(player.playerID);
        }
      }
    } catch (error) {
      throw new Error(isError(error) ? error.message : `${this._roomID}: Failed to start multiplayer game`);
    }
  }

  private async handleBlackjack(playerID: PlayerID): Promise<void> {
    try {
      const socket = this.playerSocketMap.find((item) => item.playerID === playerID)?.socket;
      if (!socket) return;

      await this._respondManager.respondWithDelay({
        roomID: socket.id,
        event: 'notificate',
        response: [successResponse(BlackjackNotification)],
      });

      const { cards: dealerCards } = this._gameStore.getDealer(this._roomID);
      const { activeHandID } = this._gameStore.getPlayer({ roomID: this._roomID, playerID });
      if (dealerCards.length === 1) {
        const [card] = dealerCards;
        switch (true) {
          case TenSet.has(card.value):
            // await this.checkDealerCombination({ playerID, roomID });
            // return;
            break;
          case MinorSet.has(card.value):
            await this.handleHandVictory({
              playerID,
              roomID: this._roomID,
              coefficient: WinCoefficient['3:2'],
              handID: activeHandID,
            });
            break;
          case card.value === CardValue.ACE:
            // await this.notificate({ notification: TakeMoneyNotification, target: socket.id });
            break;
          default:
            throw new Error('Unreachable code');
        }
      } else {
        throw new Error(`${playerID}: Failed to handle blackjack`);
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle blackjack`);
    }
  }

  private async handleHandVictory({
    coefficient,
    playerID,
    roomID,
    handID,
  }: SpecificID & { coefficient: number; handID: string }): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ playerID, roomID });
      const { bet } = this._gameStore.getHand({ roomID, playerID, handID });

      const winAmount = bet + bet * coefficient;
      const updatedBalance = player.balance + winAmount;
      this._playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });
      this._gameStore.updatePlayer({ playerID, roomID, payload: { balance: updatedBalance, bet: player.bet - bet } });
      await this.finishRoundForHand({ roomID, playerID, handID, result: GameResult.Win });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle player's victory`);
    }
  }

  private async finishRoundForHand({
    roomID,
    playerID,
    handID,
    result,
  }: SpecificID & { handID: string; result: GameResult }): Promise<void> {
    try {
    //   this._gameStore.removeHand({ handID, playerID, roomID });
        console.log('players123: ', Object.keys(ld.cloneDeep(this._gameStore.getSession(roomID).players)));
      await this._respondManager.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      await this._respondManager.respondWithDelay({
        event: 'finishRoundForHand',
        roomID,
        response: [successResponse({ roomID, playerID, handID, result })],
        delay: 2500,
      });

      //   const { hands } = this._gameStore.getPlayer({ playerID, roomID });
      //   if (hands.length > 0) {
      //     this.reassignActiveHand({ roomID, playerID });
      //     await this._respondManager.respond({
      //       event: 'updateSession',
      //       roomID,
      //       response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      //     });
      //     // await this._respondManager.respond({
      //     //   roomID,
      //     //   event: 'makeDecision',
      //     //   response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      //     // });
      //   } else {
     //  await this.finishRound({ playerID, roomID });
      //   }
    } catch (error) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to finish round for hand`);
    }
  }

  private async reassignActiveHand({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      this._gameStore.reassignActiveHand({ playerID, roomID });
      const { activeHandID } = this._gameStore.getPlayer({ roomID, playerID });
      await this._respondManager.respond({
        event: 'reassignActiveHand',
        roomID,
        response: [successResponse<ReassignActiveHand>(ld.cloneDeep({ roomID, playerID, handID: activeHandID }))],
      });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle hands`);
    }
  }

  private async finishRound({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const socket = this.playerSocketMap.find((item) => item.playerID === playerID)?.socket;
      if (!socket) return;
      // this._gameStore.resetSession({ playerID, roomID });
      await this._respondManager.respond({
          event: 'finishRound',
          roomID,
          response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
        });
        this._gameStore.removePlayerFromGame({ roomID: this._roomID, playerID });
      socket.leave(this._roomID);
      // await this.startNewRound({ roomID, playerID });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle finish round`);
    }
  }
  private async startNewRound({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      const hand = initializeHand(playerID);
      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: {
          hands: [hand],
          activeHandID: hand.handID,
          availableActions: [Action.Bet],
        },
      });
      await this._respondManager.respond({
        roomID,
        event: 'initGame',
        response: [successResponse({ game: ld.cloneDeep(this._gameStore.getSession(roomID)), playerID })],
      });
    } catch (error) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle start new round`);
    }
  }
}
