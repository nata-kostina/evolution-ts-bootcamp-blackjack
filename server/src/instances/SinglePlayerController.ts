import { Socket } from 'socket.io';
import { PlaceBetNotification } from '../constants/notifications.js';
import { store } from '../index.js';
import { Controller } from '../types.js';
import { PlayerID, GameSession, RoomID } from '../types/gameTypes.js';
import { Notification } from '../types/notificationTypes.js';
import { SpecificID, YesNoAcknowledgement } from '../types/socketTypes.js';
import { initializeGameState, initializePlayer } from '../utils/initializers.js';
import { RespondFn, respondWithoutDelay } from '../utils/respondConfig.js';
import { successResponse } from '../utils/successResponse.js';
import ld from 'lodash';

export class SinglePlayerController implements Controller {
  public respond: RespondFn = respondWithoutDelay();
  public socket:Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public handleStartGame({ playerID, socket }: { playerID: PlayerID; socket: Socket }) {
    try {
      const roomID = playerID;
      const game = initializeGameState({ roomID, playerID });

      store.addGameState(roomID, game);

      const player = initializePlayer({ playerID, roomID });
      store.joinPlayerToGameState({ roomID, player });

      const session = store.getSession(roomID);
      this.respond({ roomID, event: 'startGame', response: [successResponse<GameSession>(session)] });
      this.notificate({ roomID, notification: PlaceBetNotification });
    } catch (e: unknown) {
      console.log(`Socket ${playerID} failed to start a single game`);
    }
  }

  public handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: number }) {
    console.log("handlePlaceBet");
    try {
      const player = store.getPlayer({ roomID, playerID });
      store.updatePlayer({ roomID, playerID, payload: { bet, balance: player.balance - bet } });
      const session = store.getSession(roomID);
      this.respond({
        roomID,
        event: 'placeBet',
        response: [successResponse<GameSession>(ld.cloneDeep(session))],
      });

      console.log(`Socket ${playerID} placed a bet single`);
    } catch (e) {
      console.log(`Socket ${playerID} failed to handle a bet`);
    }
  }

  public notificate({
    roomID,
    notification,
    acknowledge,
  }: {
    roomID: RoomID;
    notification: Notification;
    acknowledge?: (ack: YesNoAcknowledgement) => void;
  }): void {
    this.respond({
      roomID,
      event: 'notificate',
      response: acknowledge
        ? [successResponse<Notification>(notification), acknowledge]
        : [successResponse<Notification>(notification)],
    });
  }

  public dealCards({ playerID, roomID }: SpecificID): void {
    // return new Promise((resolve) => {
    //   try {
    //     // dealMockCards({ playerID, roomID });
    //     const player = store.getPlayer({ playerID, roomID });
    //     store.updatePlayer({
    //       playerID: player.playerID,
    //       roomID,
    //       payload: {
    //         cards: [{ id: '1sd23', suit: 'clubs', value: CardValue.EIGHT }],
    //       },
    //     });
    //     const session = store.getSession(roomID);
    //     this.respond({
    //       roomID,
    //       event: 'updateSession',
    //       response: [successResponse<GameSession>(ld.cloneDeep(session))],
    //     });

    //     store.updateDealer({
    //       roomID,
    //       payload: {
    //         hasHoleCard: false,
    //         cards: [{ id: '1faf', suit: 'clubs', value: CardValue.ACE }],
    //       },
    //     });

    //     this.respond({
    //       roomID,
    //       event: 'updateSession',
    //       response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    //     });

    //     store.updatePlayer({
    //       playerID: player.playerID,
    //       roomID,
    //       payload: {
    //         cards: [{ id: 'ghjr', suit: 'clubs', value: CardValue.TWO }],
    //       },
    //     });

    //     this.respond({
    //       roomID,
    //       event: 'updateSession',
    //       response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    //     });

    //     store.updateDealer({
    //       roomID,
    //       payload: {
    //         hasHoleCard: true,
    //         holeCard: { id: 'wegtq', suit: 'hearts', value: CardValue.FIVE },
    //       },
    //     });

    //     this.respond({
    //       roomID,
    //       event: 'updateSession',
    //       response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    //     });
    //     resolve();
    //     //   this.dealSingleCard({ target: 'player', roomID, playerID });
    //     //   this.dealSingleCard({ target: 'dealer', roomID, playerID });
    //     //   this.dealSingleCard({ target: 'player', roomID, playerID });
    //     //   this.dealSingleCard({ target: 'dealer', roomID, playerID, asHoleCard: true });
    //   } catch (e) {
    //     console.log(`Socket ${playerID} failed to deal cards`);
    //   }
    // });
  }

  public changeRespond(value: RespondFn): void {
    this.respond = value;
  }

}
