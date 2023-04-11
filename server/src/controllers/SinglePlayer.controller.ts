import { initializePlayer } from '../utils/initializers.js';
import { successResponse } from '../utils/successResponse.js';
import ld from 'lodash';
import { isError } from '../utils/isError.js';
import { assertUnreachable } from '../utils/assertUnreachable.js';
import {
  Action,
  Bet,
  Card,
  CardValue,
  Controller,
  GameSession,
  IPlayersStore,
  IStore,
  NewCard,
  Notification,
  PlayerID,
  RoomID,
  SpecificID,
  Suit,
  UnholeCardPayload,
  WinCoefficient,
  YesNoAcknowledgement,
} from '../types/index.js';
import { IResponseManager } from '../utils/responseManager.js';
import {
  BlackjackNotification,
  defaultBalance,
  MinorSet,
  PlayerLoseNotification,
  SEVENTEEN,
  TakeMoneyNotification,
  TenSet,
  TWENTY_ONE,
  VictoryNotification,
} from '../constants/index.js';
import { CardsHandler } from '../utils/CardsHandler.js';
import { Socket } from 'socket.io';
import { generatePlayerID } from '../utils/generatePlayerID.js';

export class SinglePlayerController implements Controller {
  private readonly _playersStore: IPlayersStore;
  private readonly _gameStore: IStore;
  private readonly _respondManager: IResponseManager;

  constructor(playersStore: IPlayersStore, gameStore: IStore, respondManager: IResponseManager) {
    this._playersStore = playersStore;
    this._gameStore = gameStore;
    this._respondManager = respondManager;
  }

  public async handleInitGame({ playerID, socket }: { playerID: PlayerID; socket: Socket }): Promise<void> {
    try {
      const id = playerID ? playerID : generatePlayerID();
      const roomID = this._gameStore.createNewRoom(id);
      socket.join(roomID);
      if (this._playersStore.isNewPlayer(id)) {
        this._playersStore.updatePlayerBalance({ playerID, balance: defaultBalance });
      }
      const player = initializePlayer({
        playerID,
        roomID,
        balance: this._playersStore.getPlayerBalance(playerID),
      });
      this._gameStore.joinPlayerToGameState({ roomID, player });
        return this._respondManager
          .respondWithDelay({
            roomID,
            event: 'initGame',
            response: [successResponse({game: ld.cloneDeep(this._gameStore.getSession(roomID)), playerID: id})],
          })
          .catch((error: unknown) => {
            throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle game start`);
          });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle game start`);
    }
  }

  public async handleDecision({ roomID, playerID, action }: SpecificID & { action: Action }): Promise<void> {
    try {
      switch (action) {
        case Action.DOUBLE:
          await this.handleDouble({ roomID, playerID });
          break;
        case Action.SURENDER:
          await this.handleSurender({ roomID, playerID });
          break;
        case Action.HIT:
          await this.handleHit({ roomID, playerID });
          break;
        case Action.STAND:
          await this.checkDealerCombination({ playerID, roomID });
          break;
        case Action.Insurance:
          await this.placeInsurance({ roomID, playerID });
          await this.checkDealerCombination({ playerID, roomID });
          break;
        default:
          assertUnreachable(action);
      }
    } catch (error) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle player decision`);
    }
  }

  public async finishGame({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      this._gameStore.removeRoomFromStore(roomID);
      //   const roomMembers = io.sockets.adapter.rooms.get(roomID);
      //   if (roomMembers) {
      // roomMembers.delete(playerID);
      // io.sockets.adapter.rooms.set(roomID, roomMembers);
      //   }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle game finish`);
    }
  }
  public async handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: Bet }): Promise<void> {
    try {
        console.log("handlePlaceBet: ", { playerID, roomID, bet });
      const player = this._gameStore.getPlayer({ roomID, playerID });
      this._gameStore.updatePlayer({ roomID, playerID, payload: { bet, balance: player.balance - bet } });

      await this._respondManager.respondWithDelay({
        roomID,
        event: 'placeBet',
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      console.log(`Socket ${playerID}: handle place bet`);
    } catch (error: unknown) {
      console.log('Failed to handle place bet');
      // throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle game finish`);
    }
  }
  public async handleTakeMoneyDecision({
    playerID,
    roomID,
    response,
  }: SpecificID & { response: YesNoAcknowledgement }): Promise<void> {
    try {
      switch (response) {
        case YesNoAcknowledgement.Yes:
          await this.handlePlayerVictory({ roomID, playerID, coefficient: WinCoefficient['1:1'] });
          break;
        case YesNoAcknowledgement.No:
          await this.checkDealerCombination({ roomID, playerID });
          break;
        default:
          assertUnreachable(response);
      }
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to handle take money decision`);
    }
  }
  public async startPlay({ roomID, playerID }: SpecificID): Promise<void> {
    try {
        console.log("startPlay");
      await this.dealCards({ playerID, roomID });
      const isBlackjack = CardsHandler.isBlackjack({ roomID, playerID, store: this._gameStore });

      if (isBlackjack) {
        this.handleBlackjack({ roomID, playerID });
      } else {
        const proposeInsurance = CardsHandler.canPlaceInsurance({ roomID, playerID, store: this._gameStore });
        const canDouble = CardsHandler.canDouble({ roomID, playerID, store: this._gameStore });
        const availableActions = [Action.HIT, Action.STAND, Action.SURENDER];
        if (canDouble) {
          availableActions.push(Action.DOUBLE);
        }
        if (proposeInsurance) {
          availableActions.push(Action.Insurance);
        }
        this._gameStore.updatePlayer({ roomID, playerID, payload: { availableActions } });
        await this._respondManager.respondWithDelay({
          event: 'updateSession',
          roomID,
          response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
        });
        // availableActions.forEach((action) => {
        //   if (action === Action.Insurance) {
        //     this.notificate({ roomID, notification: InsuranceNotification });
        //   }
        //   if (action === Action.DOUBLE) {
        //     this.notificate({ roomID, notification: DoubleNotification });
        //   }
        // });
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to start play`);
    }
  }

  private async finishRound({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      this._gameStore.resetSession({ playerID, roomID });
      await this._respondManager.respondWithDelay({
        event: 'finishRound',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle finish round`);
    }
  }
  private async notificate({ roomID, notification }: { roomID: RoomID; notification: Notification }): Promise<void> {
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'notificate',
      response: [successResponse<Notification>(notification)],
    });
  }

  private async dealCards({ playerID, roomID }: SpecificID): Promise<void> {
    try {
    //   await this.dealPlayerCard({ roomID, playerID });
    //   await this.dealDealerCard(roomID);
    //   await this.dealPlayerCard({ roomID, playerID });
    //   await this.dealDealerHoleCard(roomID);
        await this.dealMockCards({ playerID, roomID });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to deal cards`);
    }
  }

  private async handleBlackjack({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'notificate',
        response: [successResponse(BlackjackNotification)],
      });
      const { cards: dealerCards } = this._gameStore.getDealer(roomID);
      if (dealerCards.length === 1) {
        const [card] = dealerCards;
        switch (true) {
          case TenSet.has(card.value):
            // this.changeRespond(sendInSequence());
            await this.checkDealerCombination({ playerID, roomID });
            break;
          case MinorSet.has(card.value):
            await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'] });
            break;
          case card.value === CardValue.ACE:
            await this.notificate({ notification: TakeMoneyNotification, roomID });
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

  private async placeInsurance({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const { balance, bet } = this._gameStore.getPlayer({ playerID, roomID });
      const insurance = bet / 2;
      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: {
          balance: balance - insurance,
          insurance,
        },
      });
      //   this.changeRespond(sendImmediately());
      await this._respondManager.respondWithDelay({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to place insurance`);
    }
  }

  private async handleDouble({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      if (!CardsHandler.canDouble({ roomID, playerID, store: this._gameStore })) {
        return;
      }
      //   this.changeRespond(sendImmediately());
      const player = this._gameStore.getPlayer({ playerID, roomID });
      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: {
          bet: player.bet * 2,
          balance: player.balance - player.bet,
        },
      });
      await this._respondManager.respondWithDelay({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });

      const deck = this._gameStore.getDeck(roomID);
      const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
      this._gameStore.updateDeck({ roomID, deck: updatedDeck });
      const mockCard = { id: 'sjfajo;', suit: Suit.Clubs, value: CardValue.TEN };
      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: { cards: [card] },
      });
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'dealCard',
        response: [
          successResponse<NewCard>({
            target: 'player',
            card,
            points: this._gameStore.getPlayer({ playerID, roomID }).points,
          }),
        ],
      });
      //   this.changeRespond(sendInSequence());
      const { points: playerPoints } = this._gameStore.getPlayer({ playerID, roomID });
      if (playerPoints > TWENTY_ONE) {
        this.handlePlayerLose({ playerID, roomID });
      } else {
        await this.checkDealerCombination({ playerID, roomID });
      }
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to handle double`);
    }
  }

  private async handleSurender({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ playerID, roomID });
      const updatedBalance = player.balance + player.bet / 2;
      this._playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });
      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: {
          bet: 0,
          balance: updatedBalance,
        },
      });
      //   this.changeRespond(sendImmediately());
      await this._respondManager.respondWithDelay({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      await this.finishRound({ roomID, playerID });
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to handle surender`);
    }
  }

  private async handleHit({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      //   this.changeRespond(sendImmediately());
      const deck = this._gameStore.getDeck(roomID);
      const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
      this._gameStore.updateDeck({ roomID, deck: updatedDeck });

      const mockCard: Card = { id: 'dofs', suit: Suit.Clubs, value: CardValue.THREE };
      this._gameStore.updatePlayer({ roomID, playerID, payload: { cards: [card] } });
      const { points: playerPoints } = this._gameStore.getPlayer({ playerID, roomID });
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'dealCard',
        response: [
          successResponse<NewCard>({
            target: 'player',
            card,
            points: playerPoints,
          }),
        ],
      });
      switch (true) {
        case playerPoints === TWENTY_ONE:
          await this.checkDealerCombination({ playerID, roomID });
          break;
        case playerPoints > TWENTY_ONE:
          await this.handlePlayerLose({ playerID, roomID });
          break;
        case playerPoints < TWENTY_ONE:
          // eslint-disable-next-line no-case-declarations
          const availableActions: Array<Action> = [Action.HIT, Action.STAND];
          this._gameStore.updatePlayer({ roomID, playerID, payload: { availableActions } });
          await this._respondManager.respondWithDelay({
            event: 'updateSession',
            roomID,
            response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
          });
          break;
        default:
          throw new Error('Unreachable code');
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle hit`);
    }
  }

  private async checkDealerCombination({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      //   this.changeRespond(sendImmediately());
      this._gameStore.updatePlayer({
        playerID,
        roomID,
        payload: {
          availableActions: [],
        },
      });
      await this._respondManager.respondWithDelay({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      const { holeCard } = this._gameStore.getDealer(roomID);
      this._gameStore.unholeCard(roomID);
      //   this.changeRespond(sendInSequence());
      const { points: dealerPoints } = this._gameStore.getDealer(roomID);
      if (holeCard) {
        await this._respondManager.respondWithDelay({
          roomID,
          event: 'unholeCard',
          response: [
            successResponse<UnholeCardPayload>({
              target: 'dealer',
              card: holeCard,
              points: dealerPoints,
            }),
          ],
        });
      }

      const { points: playerPoints, insurance } = this._gameStore.getPlayer({ playerID, roomID });

      if (dealerPoints === TWENTY_ONE) {
        if (insurance > 0) {
          this.giveInsurance({ playerID, roomID });
        }
        if (playerPoints === TWENTY_ONE) {
          await this.handlePlayerVictory({ playerID, roomID, coefficient: WinCoefficient['even'] });
        } else {
          await this.handlePlayerLose({ playerID, roomID });
        }
      } else {
        if (insurance > 0) {
          this.takeOutInsurance({ playerID, roomID });
          //   this.changeRespond(sendImmediately());
          await this._respondManager.respondWithDelay({
            event: 'updateSession',
            roomID,
            response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
          });
        }
        await this.startDealerPlay({ roomID, playerID });
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to check dealer's combination`);
    }
  }

  private async startDealerPlay({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      let { points: dealerPoints } = this._gameStore.getDealer(roomID);
      //   this.changeRespond(sendInSequence());
      while (dealerPoints < SEVENTEEN) {
        const deck = this._gameStore.getDeck(roomID);
        const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
        this._gameStore.updateDeck({ roomID, deck: updatedDeck });

        const mockCard = { id: 'sodjh', suit: Suit.Hearts, value: CardValue.FOUR };
        this._gameStore.updateDealer({ roomID, payload: { cards: [card] } });
        dealerPoints = this._gameStore.getDealer(roomID).points;
        await this._respondManager.respondWithDelay({
          roomID,
          event: 'dealCard',
          response: [
            successResponse<NewCard>({
              target: 'dealer',
              card,
              points: dealerPoints,
            }),
          ],
        });
      }

      const { points: playerPoints } = this._gameStore.getPlayer({ playerID, roomID });

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
      //   this.changeRespond(sendImmediately());
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to dealer's play`);
    }
  }

  private giveInsurance({ playerID, roomID }: SpecificID): void {
    try {
      const { balance, insurance } = this._gameStore.getPlayer({ playerID, roomID });
      if (insurance && insurance > 0) {
        this._gameStore.updatePlayer({
          playerID,
          roomID,
          payload: {
            balance: balance + insurance * 3,
            insurance: 0,
          },
        });
      }
    } catch (error) {
      throw new Error(`Socket ${playerID}: Failed to give insurance`);
    }
  }

  private takeOutInsurance({ playerID, roomID }: SpecificID): void {
    try {
      const { insurance } = this._gameStore.getPlayer({ playerID, roomID });
      if (insurance && insurance > 0) {
        this._gameStore.updatePlayer({
          playerID,
          roomID,
          payload: {
            insurance: 0,
          },
        });
      }
    } catch (error) {
      throw new Error(`Socket ${playerID}: Failed to take out insurance`);
    }
  }
  private async handlePlayerVictory({
    coefficient,
    playerID,
    roomID,
  }: SpecificID & { coefficient: number }): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ playerID, roomID });

      const winAmount = player.bet + player.bet * coefficient;
      const updatedBalance = player.balance + winAmount;

      this._gameStore.updatePlayer({ playerID, roomID, payload: { balance: updatedBalance, bet: 0 } });
      this._playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });

      await this._respondManager.respondWithDelay({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      await this.notificate({ roomID, notification: VictoryNotification });
      await this.finishRound({ playerID, roomID });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle player's victory`);
    }
  }

  private async handlePlayerLose({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      //   this.changeRespond(sendInSequence());
      const player = this._gameStore.getPlayer({ playerID, roomID });
      this._playersStore.updatePlayerBalance({ playerID, balance: player.balance });
      await this.notificate({ roomID, notification: PlayerLoseNotification });
      await this.finishRound({ playerID, roomID });
    } catch (e) {
      throw new Error(`Socket ${playerID}: Failed to handle player lose`);
    }
  }

  private async dealPlayerCard({ roomID, playerID }: SpecificID): Promise<void> {
    const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    this._gameStore.updatePlayer({
      playerID: playerID,
      roomID,
      payload: {
        cards: [card],
      },
    });

    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'player',
          card,
          points: this._gameStore.getPlayer({ playerID, roomID }).points,
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
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
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
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'dealer',
          card: { id: 'hole' },
          points: this._gameStore.getDealer(roomID).points,
        }),
      ],
    });
  }

  private async dealMockCards({ playerID, roomID }: SpecificID): Promise<void> {
    const player = this._gameStore.getPlayer({ playerID, roomID });
    const card1 = { id: '1sd23', suit: Suit.Clubs, value: CardValue.FOUR };
    this._gameStore.updatePlayer({
      playerID: player.playerID,
      roomID,
      payload: {
        cards: [card1],
      },
    });

    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'player',
          card: card1,
          points: this._gameStore.getPlayer({ playerID, roomID }).points,
        }),
      ],
    });

    const card2 = { id: '1faf', suit: Suit.Clubs, value: CardValue.ACE };
    this._gameStore.updateDealer({
      roomID,
      payload: {
        hasHoleCard: false,
        cards: [card2],
      },
    });
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'dealer',
          card: card2,
          points: this._gameStore.getDealer(roomID).points,
        }),
      ],
    });

    const card3 = { id: 'ghjr', suit: Suit.Clubs, value: CardValue.FIVE };
    this._gameStore.updatePlayer({
      playerID: player.playerID,
      roomID,
      payload: {
        cards: [card3],
      },
    });
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'player',
          card: card3,
          points: this._gameStore.getPlayer({ playerID, roomID }).points,
        }),
      ],
    });

    const card4 = { id: 'wegtq', suit: Suit.Clubs, value: CardValue.NINE };
    this._gameStore.updateDealer({
      roomID,
      payload: {
        hasHoleCard: true,
        holeCard: card4,
      },
    });
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealCard',
      response: [
        successResponse<NewCard>({
          target: 'dealer',
          card: { id: 'hole' },
          points: this._gameStore.getDealer(roomID).points,
        }),
      ],
    });
  }
}
