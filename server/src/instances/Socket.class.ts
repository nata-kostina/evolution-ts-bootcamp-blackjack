import { Socket } from 'socket.io';
import { store } from '../index.js';
import { DealSingleCard } from '../types.js';
import { TenSet } from '../constants/cards.js';
import {
    BlackjackNotification,
    StandOrTakeMoneyNotification,
    VictoryNotification,
} from '../constants/notifications.js';
import { CardsHandler } from '../utils/CardsHandler.js';
import { successResponse } from '../utils/successResponse.js';
import { Notification } from '../types/notificationTypes.js';
import { ClientParams, SpecificID } from '../types/socketTypes.js';
import { RespondFn, respondWithoutDelay } from '../utils/respondConfig.js';
import { initializeGameState, initializePlayer } from '../utils/initializers.js';
import { GameSession, WinCoefficient, RoomID, CardValue } from '../types/gameTypes.js';

export class SocketInstance {
  public connection: Socket;
  private respond: RespondFn = respondWithoutDelay;
  constructor(socket: Socket) {
    this.connection = socket;
  }

  public setRespond(value: RespondFn) {
    this.respond = value;
  }

  handleStartGame([roomID]: ClientParams<'startGame'>) {
    try {
      const game = initializeGameState(roomID);

      store.addGameState(roomID, game);

      const player = initializePlayer({ playerID: this.connection.id, roomID: this.connection.id });
      store.joinPlayerToGameState(roomID, player);

      const session = store.getSession({ roomID, playerID: player.playerID });
      this.respond({ socket: this.connection, event: 'startGame', payload: [successResponse<GameSession>(session)] });
    } catch (e: unknown) {
      console.log(`Socket ${this.connection.id} failed to start a game`);
    }
  }

  public notificate(notification: Notification) {
    this.respond({
      socket: this.connection,
      event: 'notificate',
      payload: [successResponse<Notification>(notification)],
    });
  }

  public handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: number }) {
    try {
      const player = store.getPlayer({ roomID, playerID });
      store.updatePlayer({ roomID, playerID, payload: { bet, balance: player.balance - bet } });
      const session = store.getSession({ playerID, roomID });
      this.respond({
        socket: this.connection,
        event: 'placeBet',
        payload: [successResponse<GameSession>(session)],
      });

      console.log(`Socket ${this.connection.id} placed a bet`);
    } catch (e) {
      console.log(`Socket ${this.connection.id} failed to handle a bet`);
    }
  }

  public dealCards({ playerID, roomID }: SpecificID) {
    try {
      this.dealMockCards({ playerID, roomID });
      //   this.dealSingleCard({ target: 'player', roomID, playerID });
      //   this.dealSingleCard({ target: 'dealer', roomID, playerID });
      //   this.dealSingleCard({ target: 'player', roomID, playerID });
      //   this.dealSingleCard({ target: 'dealer', roomID, playerID, asHoleCard: true });
    } catch (e) {
      console.log(`Socket ${this.connection.id} failed to deal cards`);
    }
  }

  public dealSingleCard({ playerID, roomID, target, asHoleCard }: DealSingleCard) {
    const deck = store.getDeck(roomID);
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
    store.updateDeck({ roomID, deck: updatedDeck });
    // calculate points

    if (target === 'dealer') {
      store.updateDealer({
        roomID,
        payload: {
          hasHole: asHoleCard,
          holeCard: asHoleCard ? card : undefined,
          cards: asHoleCard ? undefined : [card],
        },
      });
    } else {
      const player = store.getPlayer({ playerID, roomID });
      store.updatePlayer({
        playerID: player.playerID,
        roomID,
        payload: {
          cards: [{ id: '123', suit: 'clubs', value: CardValue.TEN }],
        },
      });
    }
    const session = store.getSession({ playerID, roomID });
    this.respond({
      socket: this.connection,
      event: 'updateSession',
      payload: [successResponse<GameSession>(session)],
    });
  }

  public checkCombination({ playerID, roomID }: SpecificID) {
    if (CardsHandler.isBlackjack({ playerID, roomID })) {
      this.respond({
        socket: this.connection,
        event: 'notificate',
        payload: [successResponse<Notification>(BlackjackNotification)],
      });
      this.handleBlackjack({ playerID, roomID });
      console.log(`Socket ${this.connection.id} has blackjack: `);
      return;
    } else {
      console.log();
    }
  }

  public handleBlackjack({ playerID, roomID }: SpecificID): void {
    const { cards } = store.getDealer(roomID);
    if (cards.length === 1) {
      const [card] = cards;
      if (TenSet.has(card.value)) {
        this.startDealerPlay(roomID);
      } else {
        if (card.value === CardValue.ACE) {
          this.respond({
            socket: this.connection,
            event: 'notificate',
            payload: [successResponse<Notification>(StandOrTakeMoneyNotification)],
          });
        } else {
          this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'] });
        }
      }
    } else {
      throw new Error('Failt to handle Blackjack');
    }
  }

  public startDealerPlay(roomID: RoomID) {
    console.log('Dealer turn');
  }

  public handlePlayerVictory({ coefficient, playerID, roomID }: SpecificID & { coefficient: number }) {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const winAmount = player.bet + player.bet * coefficient;
      store.updatePlayer({ playerID, roomID, payload: { balance: player.balance + winAmount, bet: 0 } });
      this.respond({
        socket: this.connection,
        event: 'notificate',
        payload: [successResponse<Notification>(VictoryNotification)],
      });
    } catch (e) {
      throw new Error('Fail to handle player victory');
    }
  }

  public dealMockCards({ playerID, roomID }: SpecificID) {
    const player = store.getPlayer({ playerID, roomID });
    store.updatePlayer({
      playerID: player.playerID,
      roomID,
      payload: {
        cards: [{ id: '1sd23', suit: 'clubs', value: CardValue.TEN }],
      },
    });

    this.respond({
      socket: this.connection,
      event: 'updateSession',
      payload: [successResponse<GameSession>(store.getSession({ playerID, roomID }))],
    });

    store.updateDealer({
      roomID,
      payload: {
        hasHole: false,
        cards: [{ id: '1faf', suit: 'clubs', value: CardValue.ACE }],
      },
    });

    this.respond({
      socket: this.connection,
      event: 'updateSession',
      payload: [successResponse<GameSession>(store.getSession({ playerID, roomID }))],
    });

    store.updatePlayer({
      playerID: player.playerID,
      roomID,
      payload: {
        cards: [{ id: 'ghjr', suit: 'clubs', value: CardValue.ACE }],
      },
    });

    this.respond({
      socket: this.connection,
      event: 'updateSession',
      payload: [successResponse<GameSession>(store.getSession({ playerID, roomID }))],
    });

    store.updateDealer({
      roomID,
      payload: {
        hasHole: true,
        holeCard: { id: 'wegtq', suit: 'clubs', value: CardValue.EIGHT }
      },
    });

    this.respond({
      socket: this.connection,
      event: 'updateSession',
      payload: [successResponse<GameSession>(store.getSession({ playerID, roomID }))],
    });
  }
}
