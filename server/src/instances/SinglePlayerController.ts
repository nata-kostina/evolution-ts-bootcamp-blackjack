/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Socket } from 'socket.io';
import {
  BlackjackNotification,
  DoubleNotification,
  InsuranceNotification,
  MakeDecisionNotification,
  PlaceBetNotification,
  PlayerLoseNotification,
  TakeMoneyNotification,
  VictoryNotification,
} from '../constants/notifications.js';
import { io, playersStore, store } from '../index.js';
import { AvailableActions, Controller, NewCard } from '../types.js';
import { PlayerID, GameSession, RoomID, CardValue, WinCoefficient, Decision, Suit } from '../types/gameTypes.js';
import { Notification } from '../types/notificationTypes.js';
import { Acknowledgment, SpecificID, YesNoAcknowledgement } from '../types/socketTypes.js';
import { initializeGameState, initializePlayer } from '../utils/initializers.js';
import { RespondFn, sendImmediately, sendInSequence } from '../utils/respondConfig.js';
import { successResponse } from '../utils/successResponse.js';
import ld from 'lodash';
import { defaultBalance } from '../constants/game.js';
import { isError } from '../utils/isError.js';
import { CardsHandler } from '../utils/CardsHandler.js';
import { TenSet, MinorSet, TWENTY_ONE, SEVENTEEN } from '../constants/cards.js';
import { assertUnreachable } from './../utils/assertUnreachable.js';
import { betSchema } from './../utils/validation.js';

// interface SingleController extends Controller {

// }
export class SinglePlayerController implements Controller {
  public respond: RespondFn = sendImmediately();
  public socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
  }

  public async handleStartGame({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      if (playersStore.isNewPlayer(playerID)) {
        playersStore.updatePlayerBalance({ playerID, balance: defaultBalance });
      }
      const player = initializePlayer({
        playerID,
        roomID,
        balance: playersStore.getPlayerBalance(playerID),
      });
      store.joinPlayerToGameState({ roomID, player });
      this.socket.join(roomID);
      return this.respond({
        roomID,
        event: 'startGame',
        response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
      })
        .then(() => {
          return this.notificate({ roomID, notification: PlaceBetNotification });
        })
        .then(() => {
          return this.waitPlayersToPlaceBet({ roomID, playerID });
        })
        .then(() => {
          return this.startPlay({ roomID, playerID });
        })
        .catch((error: unknown) => {
          throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle game start`);
        });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle game start`);
    }
  }

  public async waitPlayersToPlaceBet({ roomID, playerID }: SpecificID): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.respond({
        roomID,
        event: 'placeBet',
        response: [
          successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID))),
          async (err, responses) => {
            try {
              if (err) {
                reject();
              }
              if (responses) {
                const response = responses.find((response) => response.playerID === playerID);
                if (response) {
                  const bet = response.answer;
                  const { error: betError } = betSchema.validate(bet, {
                    context: { min: 0.1, max: playersStore.getPlayerBalance(playerID) },
                  });

                  if (betError) {
                    throw new Error('Invalid parameter');
                  }
                  const player = store.getPlayer({ roomID, playerID });
                  store.updatePlayer({ roomID, playerID, payload: { bet, balance: player.balance - bet } });

                  await this.respond({
                    roomID,
                    event: 'updateSession',
                    response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
                  });
                  return resolve();
                }
              } else {
                reject();
              }
            } catch (error: unknown) {
              reject();
            }
          },
        ],
      });
    });
  }

  public async startPlay({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      await this.dealCards({ playerID, roomID });
      //   await this.checkForBlackjack({ roomID, playerID });
      //   await this.checkDealerFirstCard({ roomID, playerID });
      //   await this.playWithSinglePlayer({ roomID, playerID });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to start play`);
    }
  }

  public async finishRound({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      store.updatePlayer({
        roomID,
        playerID,
        payload: {
          bet: 0,
        },
      });
      await this.respond({
        event: 'finishRound',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
      });
      store.removeRoomFromStore(roomID);
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle finish round`);
    }
  }

  public async finishGame({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      store.removeRoomFromStore(roomID);
      const roomMembers = io.sockets.adapter.rooms.get(roomID);
      if (roomMembers) {
        roomMembers.delete(playerID);
        io.sockets.adapter.rooms.set(roomID, roomMembers);
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle game finish`);
    }
  }

  public async notificate({
    roomID,
    notification,
    acknowledge,
  }: {
    roomID: RoomID;
    notification: Notification;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    acknowledge?: (err: any, responses: Acknowledgment<YesNoAcknowledgement>[]) => void;
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
    try {
      this.changeRespond(sendInSequence());
      await this.dealMockCards({ playerID, roomID });
      this.changeRespond(sendImmediately());
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to deal cards`);
    }
  }

  public async checkForBlackjack({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      if (CardsHandler.isBlackjack({ playerID, roomID })) {
        await this.respond({
          roomID,
          event: 'notificate',
          response: [successResponse(BlackjackNotification)],
        });
        await this.handleBlackjack({ playerID, roomID });
      }
    } catch (error) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to check for blackjack`);
    }
  }

  public async handleBlackjack({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const { cards: dealerCards } = store.getDealer(roomID);
      if (dealerCards.length === 1) {
        const [card] = dealerCards;
        switch (true) {
          case TenSet.has(card.value):
            break;
          case MinorSet.has(card.value):
            await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'] });
            break;
          case card.value === CardValue.ACE:
            // eslint-disable-next-line no-case-declarations
            await new Promise<void>((resolve, reject) => {
              this.notificate({
                notification: TakeMoneyNotification,
                roomID,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                acknowledge: async (err: any, responses: Acknowledgment<YesNoAcknowledgement>[]) => {
                  if (err) {
                    reject();
                  } else {
                    const response = responses.find((response) => response.playerID === playerID);
                    if (response && response.answer === 'yes') {
                      await this.handlePlayerVictory({ roomID, playerID, coefficient: WinCoefficient['1:1'] });
                    }
                    resolve();
                  }
                },
              });
            });
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

  public async checkDealerFirstCard({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      const { cards: dealerCards } = store.getDealer(roomID);
      if (dealerCards.length !== 1) {
        throw new Error("The number of dealer's must be one");
      }
      const [card] = dealerCards;
      if (card.value === CardValue.ACE) {
        await new Promise<void>((resolve, reject) => {
          this.notificate({
            roomID,
            notification: InsuranceNotification,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            acknowledge: async (err: any, responses: Acknowledgment<YesNoAcknowledgement>[]) => {
              if (err) {
                reject();
              }
              if (responses) {
                const response = responses.find((response) => response.playerID === playerID);
                if (response && response.answer === 'yes') {
                  this.placeInsurance({ playerID, roomID });
                  await this.respond({
                    roomID,
                    event: 'updateSession',
                    response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
                  });
                }
                resolve();
              }
            },
          });
        });
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to check dealer's first card`);
    }
  }
  public placeInsurance({ playerID, roomID }: SpecificID): void {
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
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to place insurance`);
    }
  }

  public async checkForDouble({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      if (CardsHandler.canDouble({ roomID, playerID })) {
        await this.notificate({ roomID, notification: DoubleNotification });
      }
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to place insurance`);
    }
  }

  public async playWithSinglePlayer({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const { cards: playerCards } = store.getPlayer({ roomID, playerID });
      const availableActions: AvailableActions = ['hit', 'stand'];

      if (CardsHandler.canDouble({ roomID, playerID })) {
        availableActions.push('double');
      }
      if (playerCards.length === 2) {
        availableActions.push('surender');
      }

      store.updatePlayer({ roomID, playerID, payload: { availableActions } });

      await new Promise<void>((resolve, reject) => {
        this.respond({
          event: 'getDecision',
          roomID,
          response: [
            successResponse(ld.cloneDeep(store.getSession(roomID))),
            async (err, responses) => {
              if (err) {
                reject();
              }
              const response = responses.find((response) => response.playerID === playerID);
              if (response) {
                switch (response.answer) {
                  case 'double':
                    await this.handleDouble({ roomID, playerID });
                    break;
                  case 'surender':
                    await this.handleSurender({ roomID, playerID });
                    break;
                  case 'hit':
                    await this.handleHit({ roomID, playerID });
                    break;
                  case 'stand':
                    await this.checkDealerCombination({ playerID, roomID });
                    break;
                  default:
                    assertUnreachable(response.answer);
                }
              }
              resolve();
            },
          ],
        });
      });
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to play with a dealer`);
    }
  }

  public async handleDouble({ playerID, roomID }: SpecificID): Promise<void> {
    try {
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

      store.updatePlayer({
        roomID,
        playerID,
        payload: { cards: [{ id: 'sjfajo;', suit: Suit.Clubs, value: CardValue.ACE }] },
      });
      const session = store.getSession(roomID);
      await this.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(session))],
      });
      const { points: playerPoints } = store.getPlayer({ playerID, roomID });
      if (playerPoints > TWENTY_ONE) {
        this.handlePlayerLose({ playerID, roomID });
      } else {
        await this.checkDealerCombination({ playerID, roomID });
      }
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to handle double`);
    }
  }

  public async handleSurender({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const player = store.getPlayer({ playerID, roomID });
      const updatedBalance = player.balance + player.bet / 2;
      playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });
      store.updatePlayer({
        roomID,
        playerID,
        payload: {
          bet: 0,
          balance: updatedBalance,
        },
      });
      await this.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
      });
      await this.finishRound({ roomID, playerID });
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to handle surender`);
    }
  }

  public async handleHit({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const deck = store.getDeck(roomID);
      const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
      store.updateDeck({ roomID, deck: updatedDeck });

      store.updatePlayer({ roomID, playerID, payload: { cards: [card] } });
      await this.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse(ld.cloneDeep(store.getSession(roomID)))],
      });
      const { points: playerPoints } = store.getPlayer({ playerID, roomID });

      switch (true) {
        case playerPoints === TWENTY_ONE:
          await this.checkDealerCombination({ playerID, roomID });
          break;
        case playerPoints > TWENTY_ONE:
          await this.handlePlayerLose({ playerID, roomID });
          break;
        case playerPoints < TWENTY_ONE:
          await this.playWithSinglePlayer({ roomID, playerID });
          break;
        default:
          throw new Error('Unreachable code');
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle hit`);
    }
  }

  public async checkDealerCombination({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      store.unholeCard(roomID);
      await this.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
      });

      const { points: dealerPoints } = store.getDealer(roomID);
      const { points: playerPoints, insurance } = store.getPlayer({ playerID, roomID });

      if (dealerPoints === TWENTY_ONE) {
        if (insurance && insurance > 0) {
          this.giveInsurance({ playerID, roomID });
          await this.respond({
            event: 'updateSession',
            roomID,
            response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
          });
        }
        if (playerPoints === TWENTY_ONE) {
          await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['even'] });
        } else {
          await this.handlePlayerLose({ playerID, roomID });
        }
      } else {
        if (insurance && insurance > 0) {
          this.takeOutInsurance({ playerID, roomID });
          await this.respond({
            event: 'updateSession',
            roomID,
            response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
          });
        }
        await this.startDealerPlay({ roomID, playerID });
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to check dealer's combination`);
    }
  }

  public async startDealerPlay({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      let { points: dealerPoints } = store.getDealer(roomID);
      this.changeRespond(sendInSequence());
      while (dealerPoints < SEVENTEEN) {
        const deck = store.getDeck(roomID);
        const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
        store.updateDeck({ roomID, deck: updatedDeck });

        store.updateDealer({ roomID, payload: { cards: [{ id: 'sodjh', suit: Suit.Hearts, value: CardValue.FOUR }] } });
        await this.respond({
          event: 'updateSession',
          roomID,
          response: [successResponse(ld.cloneDeep(store.getSession(roomID)))],
        });
        dealerPoints = store.getDealer(roomID).points;
      }

      const { points: playerPoints } = store.getPlayer({ playerID, roomID });

      switch (true) {
        case dealerPoints >= SEVENTEEN && dealerPoints < TWENTY_ONE:
          if (playerPoints === TWENTY_ONE) {
            await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'] });
          } else {
            if (playerPoints === dealerPoints) {
              await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['even'] });
            } else {
              if (playerPoints > dealerPoints) {
                await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['1:1'] });
              } else {
                await this.handlePlayerLose({ playerID, roomID });
              }
            }
          }
          break;

        case dealerPoints === TWENTY_ONE:
          if (playerPoints === TWENTY_ONE) {
            await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['even'] });
          } else {
            await this.handlePlayerLose({ playerID, roomID });
          }
          break;

        case dealerPoints > TWENTY_ONE:
          if (playerPoints === TWENTY_ONE) {
            await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'] });
          } else {
            await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['1:1'] });
          }
          break;

        default:
          throw new Error('Unreachable code');
      }
      this.changeRespond(sendImmediately());
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to dealer's play`);
    }
  }

  public giveInsurance({ playerID, roomID }: SpecificID): void {
    try {
      const { balance, insurance } = store.getPlayer({ playerID, roomID });
      if (insurance && insurance > 0) {
        store.updatePlayer({
          playerID,
          roomID,
          payload: {
            balance: balance + insurance * 3,
            insurance: undefined,
          },
        });
      }
    } catch (error) {
      throw new Error(`Socket ${playerID}: Failed to give insurance`);
    }
  }

  public takeOutInsurance({ playerID, roomID }: SpecificID): void {
    try {
      const { insurance } = store.getPlayer({ playerID, roomID });
      if (insurance && insurance > 0) {
        store.updatePlayer({
          playerID,
          roomID,
          payload: {
            insurance: undefined,
          },
        });
      }
    } catch (error) {
      throw new Error(`Socket ${playerID}: Failed to take out insurance`);
    }
  }
  public async handlePlayerVictory({
    coefficient,
    playerID,
    roomID,
  }: SpecificID & { coefficient: number }): Promise<void> {
    try {
      const player = store.getPlayer({ playerID, roomID });

      const winAmount = player.bet + player.bet * coefficient;
      const updatedBalance = player.balance + winAmount;

      store.updatePlayer({ playerID, roomID, payload: { balance: updatedBalance, bet: 0 } });
      playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });

      await this.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(store.getSession(roomID)))],
      });
      await this.notificate({ roomID, notification: VictoryNotification });
      await this.finishRound({ playerID, roomID });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle player's victory`);
    }
  }

  public async handlePlayerLose({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      const player = store.getPlayer({ playerID, roomID });
      playersStore.updatePlayerBalance({ playerID, balance: player.balance });
      await this.notificate({ roomID, notification: PlayerLoseNotification });
      await this.finishRound({ playerID, roomID });
    } catch (e) {
      throw new Error(`Socket ${playerID}: Failed to handle player lose`);
    }
  }

  public changeRespond(value: RespondFn): void {
    this.respond = value;
  }

  public async dealMockCards({ playerID, roomID }: SpecificID) {
    const player = store.getPlayer({ playerID, roomID });
    const card1 = { id: '1sd23', suit: Suit.Clubs, value: CardValue.SIX };
    store.updatePlayer({
      playerID: player.playerID,
      roomID,
      payload: {
        cards: [card1],
      },
    });

    await this.respond({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'player',
          card: card1,
          points: store.getPlayer({ playerID, roomID }).points,
        }),
      ],
    });
    // await this.respond({
    //   roomID,
    //   event: 'updateSession',
    //   response: [successResponse<GameSession>(store.getSession(roomID))],
    // });
    const card2 = { id: '1faf', suit: Suit.Clubs, value: CardValue.ACE };
    store.updateDealer({
      roomID,
      payload: {
        hasHoleCard: false,
        cards: [card2],
      },
    });
    await this.respond({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'dealer',
          card: card2,
          points: store.getDealer(roomID).points,
        }),
      ],
    });

    //     await this.respond({
    //       roomID,
    //       event: 'updateSession',
    //       response: [successResponse<GameSession>(store.getSession(roomID))],
    //     });
    const card3 = { id: 'ghjr', suit: Suit.Clubs, value: CardValue.FOUR };
    store.updatePlayer({
      playerID: player.playerID,
      roomID,
      payload: {
        cards: [card3],
      },
    });
    await this.respond({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'player',
          card: card3,
          points: store.getPlayer({ playerID, roomID }).points,
        }),
      ],
    });

    //     await this.respond({
    //       roomID,
    //       event: 'updateSession',
    //       response: [successResponse<GameSession>(store.getSession(roomID))],
    //     });
    const card4 = { id: 'wegtq', suit: Suit.Hearts, value: CardValue.TWO };
    store.updateDealer({
      roomID,
      payload: {
        hasHoleCard: true,
        holeCard: card4,
      },
    });
    await this.respond({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'dealer',
          card: {id: 'hole'},
          points: store.getDealer(roomID).points,
        }),
      ],
    });

    //     await this.respond({
    //       roomID,
    //       event: 'updateSession',
    //       response: [successResponse<GameSession>(store.getSession(roomID))],
    //     });
  }
}
