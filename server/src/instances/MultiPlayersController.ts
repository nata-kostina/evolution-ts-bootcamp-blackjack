import { Socket } from 'socket.io';
import {
  BlackjackNotification,
  DisconnectionNotification,
  DoubleNotification,
  InsuranceNotification,
  MakeDecisionNotification,
  PlaceBetNotification,
  TakeMoneyNotification,
  VictoryNotification,
  PlayerLoseNotification,
} from '../constants/notifications.js';
import { io, playersStore, store } from '../index.js';
import { Controller, DealSingleCard } from '../types.js';
import { PlayerID, GameSession, RoomID, CardValue, WinCoefficient, Decision } from '../types/gameTypes.js';
import { Notification } from '../types/notificationTypes.js';
import { Acknowledgment, SpecificID } from '../types/socketTypes.js';
import { CardsHandler } from '../utils/CardsHandler.js';
import { initializePlayer } from '../utils/initializers.js';
import { RespondFn, respondWithoutDelay, sendInSequence } from '../utils/respondConfig.js';
import { successResponse } from '../utils/successResponse.js';
import ld from 'lodash';
import { TenSet, MinorSet, TWENTY_ONE } from '../constants/cards.js';

interface MultiCintroller extends Controller {
  waitOthersToJoin: ({ roomID, playerID }: SpecificID) => void;
}

export class MultiPlayersController implements MultiCintroller {
  public respond: RespondFn = respondWithoutDelay();
  public socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public changeRespond(value: RespondFn): void {
    this.respond = value;
  }

  public async handleStartGame({ playerID, socket }: { playerID: PlayerID; socket: Socket }) {
    try {
      const availableRoom = store.getAvailableRoomID();
      const roomID = availableRoom ? availableRoom : store.createNewRoom(playerID);

      const savedPlayerBalance = playersStore.getPlayer(playerID);
      const player = savedPlayerBalance
        ? initializePlayer({ playerID, roomID, balance: savedPlayerBalance })
        : initializePlayer({ playerID, roomID });
      store.joinPlayerToGameState({ roomID, player });
      store.updatePlayer({ roomID, playerID, payload: { status: 'ready-to-play' } });
      socket.join(roomID);
      await this.waitOthersToJoin({ roomID, playerID });
      await this.waitPlayersToPlaceBet({ roomID, playerID });
      await this.dealCards({ playerID, roomID });
      console.log(`${playerID} afyer this.dealCards`);
    } catch (e: unknown) {
      console.log(`Socket ${playerID} failed to start a multiplayer game`);
    }
  }
  public async waitOthersToJoin({ roomID, playerID }: SpecificID): Promise<void> {
    return new Promise((resolve) => {
      let counter = 0;
      const step = 500;
      const interval = setInterval(() => {
        console.log('interval waitOthersToJoin');
        counter += step;

        if (counter > 5000) {
          const controller = store.getController(roomID);
          controller.callOnce(playerID, async () => {
            const session = store.getSession(roomID);
            store.startGame(roomID);
            await this.respond({
              roomID,
              event: 'startGame',
              response: [successResponse<GameSession>(ld.cloneDeep(session))],
            });
            await this.respond({
              roomID,
              event: 'notificate',
              response: [successResponse<Notification>(PlaceBetNotification)],
            });
          });
          clearInterval(interval);
          resolve();
          return;
        }
      }, step);
    });
  }

  public async waitPlayersToPlaceBet({ roomID, playerID }: SpecificID): Promise<void> {
    return await new Promise((resolve, reject) => {
      try {
        let counter = 0;
        const interval = setInterval(() => {
          counter += 800;
          try {
            const { players } = store.getSession(roomID);

            if (Object.keys(players).length === 0) {
              console.log(`${playerID} No players. should stop game`);
              const controller = store.getController(roomID);
              controller.callOnce(playerID, () => {
                store.removeRoomFromStore(roomID);
              });
              clearInterval(interval);
              return reject();
            }
            const notReady = Object.keys(players).filter((key) => players[key].bet === 0);
            console.log(`${playerID} new interval, who did not place bet: ${notReady}`);

            const roomMembers = io.sockets.adapter.rooms.get(roomID);
            if (roomMembers) {
              if (!roomMembers.has(playerID)) {
                console.log('this room does not have ', playerID);
                this.respond({
                  roomID: playerID,
                  event: 'notificate',
                  response: [successResponse(DisconnectionNotification)],
                });
                clearInterval(interval);
                return reject();
              }
            }

            if (counter > 20000) {
              console.log(`${playerID} Remove not ready players from session `, notReady);

              const controller = store.getController(roomID);
              controller.callOnce(playerID, () => {
                try {
                  notReady.forEach((id) => {
                    console.log('Remove id: ', id);
                    store.removePlayerFromGame({ playerID: id, roomID });
                    this.disconnectPlayerFromARoom({ playerID: id, roomID });
                    this.respond({
                      roomID: playerID,
                      event: 'notificate',
                      response: [successResponse(DisconnectionNotification)],
                    });
                  });
                  const session = store.getSession(roomID);
                  this.respond({ event: 'updateSession', roomID, response: [successResponse(ld.cloneDeep(session))] });
                } catch (e: unknown) {
                  clearInterval(interval);
                  console.log('Error at controller call Once');
                  return reject();
                }
              });

              clearInterval(interval);
              if (notReady.includes(playerID)) {
                return reject();
              } else {
                return resolve();
              }
            }

            if (notReady.length === 0) {
              console.log(`${playerID} All players placed bet`);
              clearInterval(interval);
              return resolve();
            }
          } catch (error) {
            clearInterval(interval);
            console.log('Failed set interval');
            return reject();
          }
        }, 800);
      } catch (error) {
        console.log('Failed to waitPlayersToPlaceBet');
      }
    });
  }

  public disconnectPlayerFromARoom({ playerID, roomID }: SpecificID) {
    const roomMembers = io.sockets.adapter.rooms.get(roomID);
    if (roomMembers) {
      roomMembers.delete(playerID);
      io.sockets.adapter.rooms.set(roomID, roomMembers);
    }
  }

  public handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: number }): void {
    console.log(`${playerID} handlePlaceBet`);

    const player = store.getPlayer({ roomID, playerID });
    store.updatePlayer({ roomID, playerID, payload: { bet, balance: player.balance - bet } });
    const session = store.getSession(roomID);
    this.respond({
      roomID,
      event: 'waitOthers',
      response: [successResponse<GameSession>(ld.cloneDeep(session))],
    });
  }

  public async notificate({
    roomID,
    notification,
    acknowledge,
  }: {
    roomID: RoomID;
    notification: Notification;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acknowledge?: (err: any, responses: any) => void;
  }): Promise<void> {
    await this.respond({
      roomID,
      event: 'notificate',
      response: acknowledge
        ? [successResponse<Notification>(notification), acknowledge]
        : [successResponse<Notification>(notification)],
    });
  }

  public async dealCards({ playerID, roomID }: SpecificID): Promise<void> {
    const { organizer } = store.getGame(roomID);
    if (playerID !== organizer) {
      return;
    }
    return new Promise((resolve, reject) => {
      console.log(`${playerID} Inside dealCards`);
      try {
        console.log('MAKE DELAYED SEQUENCE');
        const { controller } = store.getGame(roomID);
        console.log(organizer);
        controller.callOnce(playerID, async () => {
          console.log(`${playerID} calls once`);
          this.changeRespond(sendInSequence());
          await this.dealMockCards({ playerID, roomID });
          console.log('after this.dealmockcards');
          await this.checkAllPlayersCombination({ playerID, roomID });
          console.log('after this.checkAllPlayersCombination');
          resolve();
        });
      } catch (e) {
        console.log(`Socket ${playerID} failed to deal cards`);
        return reject();
      }
    });
  }

  public dealSingleCard({ playerID, roomID, target, asHoleCard }: DealSingleCard) {
    const deck = store.getDeck(roomID);
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
    store.updateDeck({ roomID, deck: updatedDeck });

    if (target === 'dealer') {
      store.updateDealer({
        roomID,
        payload: {
          hasHoleCard: asHoleCard,
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
          cards: [card],
        },
      });
    }
    const session = store.getSession(roomID);
    console.log('dealSingleCard dealer card ', session.dealer.cards);
    this.respond({
      roomID,
      event: 'updateSession',
      response: [successResponse<GameSession>(ld.cloneDeep(session))],
    });
  }

  public async checkAllPlayersCombination({ playerID, roomID }: SpecificID): Promise<void> {
    console.log('check all players combination');
    const { players } = store.getGame(roomID);

    for (const player in players) {
      console.log(`${player} started to check for balckjack`);
      await this.checkForBlackjack({ playerID: player, roomID });
      console.log(`${player} checked for balckjack`);
    }
    await this.checkDealerFirstCard(roomID);
    console.log(`finished to checkDealerFirstCard`);

    await this.checkForDouble(roomID);
    console.log('after this.checkForDouble');

    for (const player in players) {
      console.log(`${player} started to play with dealer`);
      await this.playWithSinglePlayer({ playerID: player, roomID });
      console.log(`${player} finished to play with dealer`);
    }
  }
  public async checkDealerFirstCard(roomID: RoomID): Promise<void> {
    try {
      const { cards: dealerCards } = store.getDealer(roomID);
      const [card] = dealerCards;
      if (card.value === CardValue.ACE) {
        await new Promise<void>((resolve) => {
          this.notificate({
            roomID,
            notification: InsuranceNotification,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            acknowledge: async (err: any, responses: Acknowledgment[]) => {
              if (err) {
                // some clients did not acknowledge the event in the given delay
              }
              if (responses) {
                const wantsInsurance = responses.filter((response) => response.answer === 'yes');
                if (wantsInsurance.length > 0) {
                  wantsInsurance.forEach((item) => {
                    this.placeInsurance({ playerID: item.playerID, roomID });
                  });
                  await this.respond({
                    roomID,
                    event: 'updateSession',
                    response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
                  });
                }
                console.log(responses);
                return resolve();
              }
            },
          });
        });
      }
    // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  public async playWithSinglePlayer({ playerID, roomID }: SpecificID) {
    await this.notificate({
      roomID: playerID,
      notification: MakeDecisionNotification,
    });
    console.log(`${playerID} after MakeDecisionNotification`);
    await new Promise<void>((resolve) => {
      this.respond({
        event: 'getDecision',
        roomID: playerID,
        response: [
          successResponse<string>("Waiting for player's decision"),
          async (err, responses) => {
            const response = responses.find((response) => response.playerID === playerID);
            if (response) {
              console.log(response);
              switch (response.ack) {
                case Decision.Double:
                  await this.handleDouble({ roomID, playerID });
                  break;
                default:
                  break;
              }
            }
            console.log(`${playerID} gave decision`);
            resolve();
          },
        ],
      });
    });
    // return new Promise<void>((resolve) => {
    // })
    //   this.notificate({
    //     roomID: playerID,
    //     notification: MoveNotification,
    //     acknowledge: (err: any, responses) => {
    //       if (responses) {
    //           if (responses.length
    //              === 0 ) {
    //               console.log(`${playerID} did not make decision on time`)
    //               store.removePlayerFromGame({playerID, roomID})
    //               this.disconnectPlayerFromARoom({roomID, playerID})
    //           } else {
    //               console.log(responses);

    //           }
    //         resolve()
    //       }
    //     },
    //   });
    // });
  }

  public async handleDouble({ playerID, roomID }: SpecificID) {
    const player = store.getPlayer({ playerID, roomID });
    store.updatePlayer({
      roomID,
      playerID,
      payload: {
        bet: player.bet * 2,
        balance: player.balance - player.bet,
      },
    });
    await this.respond({
      event: 'updateSession',
      roomID,
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });

    const deck = store.getDeck(roomID);
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
    store.updateDeck({ roomID, deck: updatedDeck });

    store.updatePlayer({ roomID, playerID, payload: { cards: [card] } });
    const session = store.getSession(roomID);
    this.respond({
      event: 'updateSession',
      roomID,
      response: [successResponse<GameSession>(session)],
    });
    const { points: playerPoints } = store.getPlayer({ playerID, roomID });
    if (playerPoints > TWENTY_ONE) {
      // this.handlePlayerLose({ playerID, roomID });
    } else {
      console.log("wait others, and after check dealer's combination");
      // this.checkDealerCombination({ playerID, roomID });
    }
  }

  public async handlePlayerLose({ playerID, roomID }: SpecificID) {
    try {
      const player = store.getPlayer({ playerID, roomID });

      await this.notificate({ roomID: playerID, notification: PlayerLoseNotification });

      await this.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(store.getSession(roomID))],
      });
      console.log('disconnect player, if no players, finish game')
      // this.finishRound({ playerID, roomID });
    } catch (e) {
      throw new Error('Failed to handle player lose');
    }
  }

  public async dealMockCards({ playerID, roomID }: SpecificID): Promise<void> {
    const { players } = store.getGame(roomID);
    const ids = Object.keys(players);
    // Plater 1 Card 1
    const player0 = store.getPlayer({ playerID: ids[0], roomID });
    store.updatePlayer({
      playerID: player0.playerID,
      roomID,
      payload: {
        cards: [{ id: '1sd23', suit: 'clubs', value: CardValue.FOUR }],
      },
    });
    await this.respond({
      roomID,
      event: 'updateSession',
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });
    // Plater 2 Card 1
    const player1 = store.getPlayer({ playerID: ids[1], roomID });
    store.updatePlayer({
      playerID: player1.playerID,
      roomID,
      payload: {
        cards: [{ id: 'argv', suit: 'clubs', value: CardValue.TEN }],
      },
    });
    await this.respond({
      roomID,
      event: 'updateSession',
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });
    // Dealer Card 1
    store.updateDealer({
      roomID,
      payload: {
        hasHoleCard: false,
        cards: [{ id: '1faf', suit: 'clubs', value: CardValue.ACE }],
      },
    });
    await this.respond({
      roomID,
      event: 'updateSession',
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });
    // Player 1 Card 2

    const player2 = store.getPlayer({ playerID: ids[0], roomID });
    store.updatePlayer({
      playerID: player2.playerID,
      roomID,
      payload: {
        cards: [{ id: '1sdыам23', suit: 'clubs', value: CardValue.FIVE }],
      },
    });
    await this.respond({
      roomID,
      event: 'updateSession',
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });
    // Player 2 Card 2

    const player3 = store.getPlayer({ playerID: ids[1], roomID });
    store.updatePlayer({
      playerID: player3.playerID,
      roomID,
      payload: {
        cards: [{ id: 'aваскrgv', suit: 'clubs', value: CardValue.ACE }],
      },
    });
    await this.respond({
      roomID,
      event: 'updateSession',
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });
    // Dealer Card 2

    store.updateDealer({
      roomID,
      payload: {
        hasHoleCard: true,
        holeCard: { id: 'wegtq', suit: 'hearts', value: CardValue.FIVE },
      },
    });
    await this.respond({
      roomID,
      event: 'updateSession',
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });
  }

  public async checkForBlackjack({ playerID, roomID }: SpecificID): Promise<void> {
    if (CardsHandler.isBlackjack({ playerID, roomID })) {
      await this.respond({
        roomID: playerID,
        event: 'notificate',
        response: [successResponse(BlackjackNotification)],
      });
      //   this.notificate({ roomID: playerID, notification: BlackjackNotification });
      await this.handleBlackjack({ playerID, roomID });
      //   console.log(`Socket ${playerID} has blackjack: `);
      //   // store.updatePlayer({ roomID, playerID, payload: { status: 'combination-checked' } });
      //   // return resolve();
    }
  }

  public async handleBlackjack({ playerID, roomID }: SpecificID): Promise<void> {
    const { cards: dealerCards } = store.getDealer(roomID);
    if (dealerCards.length === 1) {
      const [card] = dealerCards;
      switch (true) {
        case TenSet.has(card.value):
          // this.checkDealerCombination({ playerID, roomID });
          break;
        case MinorSet.has(card.value):
          await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'] });
          console.log('after handlePlayerVictory');
          break;
        case card.value === CardValue.ACE:
          // eslint-disable-next-line no-case-declarations
          const respond = async () => {
            return new Promise<void>((resolve) => {
              this.notificate({
                notification: TakeMoneyNotification,
                roomID: playerID,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                acknowledge: async (err: any, responses: Acknowledgment[]) => {
                  if (err) {
                    // some clients did not acknowledge the event in the given delay
                  } else {
                    console.log(responses);
                    const playerResponse = responses.find((response) => response.playerID === playerID);
                    if (playerResponse && playerResponse.answer === 'yes') {
                      await this.handlePlayerVictory({ roomID, playerID, coefficient: WinCoefficient['1:1'] });
                    } 
                    resolve();
                  }
                },
              });
            });
          };
          await respond();
          console.log('AFTER AWAIT RESPOND()');

          break;
        default:
          throw new Error('Unreachable code');
      }
    } else {
      throw new Error('Failed to handle Blackjack');
    }
  }

  public async checkForDouble(roomID: RoomID): Promise<void> {
    try {
      const { players } = store.getGame(roomID);
      for (const playerID in players) {
        if (CardsHandler.canDouble({ roomID, playerID })) {
          await this.notificate({ roomID: playerID, notification: DoubleNotification });
        }
      }
    } catch (error) {
        console.log("Failed to check for double")
    }
  }

  public async handlePlayerVictory({ coefficient, playerID, roomID }: SpecificID & { coefficient: number }) {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const winAmount = player.bet + player.bet * coefficient;
      const updatedBalance = player.balance + winAmount;
      store.updatePlayer({ playerID, roomID, payload: { balance: updatedBalance, bet: 0 } });
      playersStore.addPlayer(playerID, updatedBalance);
      await this.notificate({ roomID: playerID, notification: VictoryNotification });

      await this.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
      });
      await this.finishRound({ playerID, roomID });
    } catch (e) {
      throw new Error('Fail to handle player victory');
    }
  }

  public async finishRound({ playerID, roomID }: SpecificID) {
    await this.respond({
      event: 'finishRound',
      roomID: playerID,
      response: [successResponse<GameSession>(ld.cloneDeep(store.getResetSession({ playerID, roomID })))],
    });
    this.disconnectPlayerFromARoom({ playerID, roomID });
    store.removePlayerFromGame({ playerID, roomID });
    await this.respond({
      event: 'updateSession',
      roomID,
      response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
    });
  }

  public placeInsurance({ playerID, roomID }: SpecificID) {
    try {
      const { balance, bet } = store.getPlayer({ playerID, roomID });
      const insurance = bet / 2;
      store.updatePlayer({
        roomID,
        playerID,
        payload: {
          balance: balance - insurance,
          insurance,
        },
      });
    } catch (error) {
      throw new Error('Failed to place insurance');
    }
  }
}
