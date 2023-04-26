/* eslint-disable @typescript-eslint/no-empty-function */
import { Server, Socket } from 'socket.io';
import { defaultBalance, PlaceBetNotification, WaitPlayesNotification } from '../constants/index.js';
import { GameSessionManager } from '../store/GameSessionManager.class.js';
import {
  Action,
  Bet,
  ClientToServerEvents,
  Controller,
  GameSession,
  IPlayersStore,
  IStore,
  Notification,
  NotificationVariant,
  PlayerID,
  RoomID,
  ServerToClientEvents,
  SpecificID,
  YesNoAcknowledgement,
} from '../types/index.js';
import { generatePlayerID } from '../utils/generatePlayerID.js';
import { initializePlayer } from '../utils/initializers.js';
import { isError } from '../utils/isError.js';
import { IResponseManager } from '../utils/responseManager.js';
import { successResponse } from '../utils/successResponse.js';
import ld from 'lodash';

export class MultiPlayersController implements Controller {
  private readonly _playersStore: IPlayersStore;
  private readonly _gameStore: IStore;
  private readonly _respondManager: IResponseManager;
  private sessionsManagers: Array<GameSessionManager> = [];

  constructor(playersStore: IPlayersStore, gameStore: IStore, respondManager: IResponseManager) {
    this._playersStore = playersStore;
    this._gameStore = gameStore;
    this._respondManager = respondManager;
  }
  public async handleInitGame({
    playerID,
    socket,
    io,
  }: {
    playerID: PlayerID | null;
    socket: Socket;
    io: Server<ClientToServerEvents, ServerToClientEvents>;
  }): Promise<void> {
    try {
      console.log('HANDLE INIT GAME');
      const id = playerID || generatePlayerID();

      const availableRoom = this._gameStore.getAvailableRoomID(io);

      const roomID = availableRoom || this._gameStore.createNewRoom(id);

      const socketRooms = socket.rooms;
      socketRooms.forEach((room) => {
        if (room.startsWith('Room_id_')) {
          socket.leave(room);
        }
      });

      socket.join(roomID);

      if (this._playersStore.isNewPlayer(id)) {
        this._playersStore.updatePlayerBalance({ playerID: id, balance: defaultBalance });
      }

      const player = initializePlayer({
        playerID: id,
        roomID,
        balance: this._playersStore.getPlayerBalance(id),
      });

      this._gameStore.joinPlayerToGameState({ roomID, player });

      let sessionManager = this.sessionsManagers.find((session) => session.roomID === roomID);
      if (!sessionManager) {
        sessionManager = new GameSessionManager(roomID, this._respondManager, this._gameStore);
        this.sessionsManagers.push(sessionManager);
      }
      sessionManager.addPlayer(player);

      await this.notificate({ roomID: socket.id, notification: WaitPlayesNotification });
      await sessionManager.waitPlayers(socket.id);

      console.log(`Socket ${socket.id}: stop waiting`);
      await this.notificate({ roomID: socket.id, notification: PlaceBetNotification });
      await this._respondManager.respondWithDelay({
        roomID: socket.id,
        event: 'initGame',
        response: [successResponse({ game: ld.cloneDeep(this._gameStore.getSession(roomID)), playerID: id })],
      });
    } catch (error) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle game start`);
    }
  }
  public async handleDecision({ roomID, playerID, action }: SpecificID & { action: Action }): Promise<void> {}

  public async handlePlaceBet({
    playerID,
    roomID,
    bet,
    socketID,
  }: SpecificID & { bet: Bet; socketID: string }): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ roomID, playerID });
      this._gameStore.updateHand({ roomID, playerID, handID: player.activeHandID, payload: { bet } });
      this._gameStore.updatePlayer({ roomID, playerID, payload: { bet, balance: player.balance - bet } });
      await this._respondManager.respondWithDelay({
        roomID: socketID,
        event: 'placeBet',
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'updateSession',
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });

      const sessionManager = this.sessionsManagers.find((session) => session.roomID === roomID);
      if (!sessionManager) {
        throw new Error('No session found');
      }
      await sessionManager.waitPlayersToPlaceBet(socketID);

      console.log(`Player ${playerID}: handle place bet`);
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle placing bet`);
    }
  }

  public async handleTakeMoneyDecision({
    playerID,
    roomID,
    response,
  }: SpecificID & { response: YesNoAcknowledgement }): Promise<void> {}
  
  
  public async startPlay({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ roomID, playerID });
      const sessionManager = this.sessionsManagers.find((session) => session.roomID === roomID);
      if (!sessionManager) {
        throw new Error('No session found');
      }
      await sessionManager.dealCards(playerID);
    //   await this.dealCards({ playerID, roomID });
    //   const isBlackjack = CardsHandler.isBlackjack({ roomID, playerID, store: this._gameStore });
    //   if (isBlackjack) {
    //     this.handleBlackjack({ roomID, playerID });
    //   } else {
    //     const proposeInsurance = CardsHandler.canPlaceInsurance({ roomID, playerID, store: this._gameStore });
    //     const canDouble = CardsHandler.canDouble({ roomID, playerID, store: this._gameStore });
    //     const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
    //     const availableActions = [Action.Hit, Action.Stand, Action.Surender];
    //     if (canDouble) {
    //       availableActions.push(Action.Double);
    //     }
    //     if (proposeInsurance) {
    //       availableActions.push(Action.Insurance);
    //     }
    //     if (canSplit) {
    //       availableActions.push(Action.Split);
    //     }
    //     this._gameStore.updatePlayer({
    //       roomID,
    //       playerID,
    //       payload: {
    //         availableActions,
    //       },
    //     });
    //     await this._respondManager.respondWithDelay({
    //       event: 'updateSession',
    //       roomID,
    //       response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
    //     });
    //     await this._respondManager.respond({
    //       roomID,
    //       event: 'makeDecision',
    //       response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
    //     });
    //   }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to start play`);
    }
  }
  private async notificate({ roomID, notification }: { roomID: RoomID; notification: Notification }): Promise<void> {
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'notificate',
      response: [successResponse<Notification>(notification)],
    });
  }

  
}
