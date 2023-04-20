import { initializePlayer } from '../utils/initializers.js';
import { successResponse } from '../utils/successResponse.js';
import ld from 'lodash';
import { isError } from '../utils/isError.js';
import { assertUnreachable } from '../utils/assertUnreachable.js';
import {
  Bet,
  CardValue,
  Controller,
  GameSession,
  IPlayersStore,
  IStore,
  Notification,
  PlayerID,
  RoomID,
  SpecificID,
  Suit,
  UnholeCardPayload,
  WinCoefficient,
  YesNoAcknowledgement,
  Action,
  DealPlayerCard,
  DealDealerCard,
  Card,
  FinishRoundForHand,
  GameResult,
  ReassignActiveHand,
} from '../types/index.js';
import { IResponseManager } from '../utils/responseManager.js';
import {
  BlackjackNotification,
  defaultBalance,
  MinorSet,
  PlayerLoseNotification,
  PointsMap,
  SEVENTEEN,
  TakeMoneyNotification,
  TenSet,
  TWENTY_ONE,
  VictoryNotification,
} from '../constants/index.js';
import { CardsHandler } from '../utils/CardsHandler.js';
import { Socket } from 'socket.io';
import { generatePlayerID } from '../utils/generatePlayerID.js';
import { v4 } from 'uuid';
import { initializeHand } from './../utils/initializers.js';

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
      const id = playerID || generatePlayerID();

      const roomID = this._gameStore.createNewRoom(id);
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

      return this._respondManager
        .respondWithDelay({
          roomID,
          event: 'initGame',
          response: [successResponse({ game: ld.cloneDeep(this._gameStore.getSession(roomID)), playerID: id })],
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
        // this._gameStore.updatePlayer({roomID, playerID, payload: {availableActions: []}})
        // await this._respondManager.respond({
        //     event: 'updateSession',
        //     roomID,
        //     response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
        //   });
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
          await this.handleStand({ roomID, playerID });
          break;
        case Action.Insurance:
          await this.placeInsurance({ roomID, playerID });
          await this.checkDealerCombination({ playerID, roomID });
          break;
        case Action.Split:
          await this.handleSplit({ roomID, playerID });
          break;
        case Action.Bet:
          break;
        default:
          assertUnreachable(action);
      }
    } catch (error) {
      console.log(error);
      // throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle player decision`);
    }
  }

  private async handleStand({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      const { activeHandID } = this._gameStore.getPlayer({ roomID, playerID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID: activeHandID,
        payload: {
          isStanding: true,
        },
      });

      const { hands } = this._gameStore.getPlayer({ roomID, playerID });
      if (hands.every((hand) => hand.isStanding)) {
        await this.checkDealerCombination({ playerID, roomID });
      } else {
        await this.reassignActiveHand({ roomID, playerID });
        const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
        const availableActions = [Action.HIT, Action.STAND];
        if (canSplit) {
            availableActions.push(Action.DOUBLE);
        }
        this._gameStore.updatePlayer({roomID, playerID, payload: {
            availableActions,
        }})
        await this._respondManager.respond({
          event: 'updateSession',
          roomID,
          response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
        });
        await this._respondManager.respond({
            roomID,
            event: 'makeDecision',
            response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
          });
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle stand`);
    }
  }

  private async handleSplit({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      if (!CardsHandler.canSplit({ roomID, playerID, store: this._gameStore })) return;
      const activeHand = this._gameStore.getActiveHand({ roomID, playerID });
      if (activeHand.cards.length !== 2) return;

      const [firstCard, secondCard] = activeHand.cards;
      if (firstCard.value === CardValue.ACE) {
        await this.handleSplitAces({ roomID, playerID });
        return;
      }

      const { bet, balance } = this._gameStore.getPlayer({ roomID, playerID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID: activeHand.handID,
        payload: {
          cards: [firstCard],
        },
      });
      const updatedActiveHand = this._gameStore.getActiveHand({ roomID, playerID });

      const newHand = initializeHand(activeHand.handID);
      newHand.bet = bet;
      newHand.cards = [secondCard];
      newHand.points = PointsMap[secondCard.value];
      
      const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
      const availableActions = [Action.HIT, Action.STAND];
      if (canSplit) {
          availableActions.push(Action.DOUBLE);
      }

      const player = this._gameStore.getPlayer({roomID, playerID});

      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: {
          bet: bet * 2,
          hands: ld.cloneDeep([...player.hands, newHand]),
          balance: balance - bet,
          availableActions,
        },
      });
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'split',
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'makeDecision',
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
    } catch (error) {
      throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle split`);
    }
  }
  public async handleSplitAces({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const activeHand = this._gameStore.getActiveHand({ roomID, playerID });
      const [firstCard, secondCard] = activeHand.cards;
      if (firstCard.value !== CardValue.ACE) {
        return;
      }

      const { bet, balance } = this._gameStore.getPlayer({ roomID, playerID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID: activeHand.handID,
        payload: {
          cards: [firstCard],
        },
      });
      const updatedActiveHand = this._gameStore.getActiveHand({ roomID, playerID });

      const newHand = initializeHand(activeHand.handID);
      newHand.bet = bet;
      newHand.cards = [secondCard];
      newHand.points = PointsMap[secondCard.value];

      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: {
          bet: bet * 2,
          hands: ld.cloneDeep([updatedActiveHand, newHand]),
          balance: balance - bet,
          availableActions: [],
        },
      });
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'split',
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });

      const deck = this._gameStore.getDeck(roomID);
      const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
      this._gameStore.updateDeck({ roomID, deck: updatedDeck });
      const mockCard = { id: 'sjfajo;', suit: Suit.Clubs, value: CardValue.FOUR };
      const hand = this._gameStore.getHand({ roomID, playerID, handID: updatedActiveHand.handID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID: updatedActiveHand.handID,
        payload: { cards: ld.cloneDeep([...hand.cards, mockCard]) },
      });
      const { points: playerPoints1 } = this._gameStore.getHand({ roomID, playerID, handID: updatedActiveHand.handID });

      await this._respondManager.respondWithDelay({
        roomID,
        event: 'dealPlayerCard',
        response: [
          successResponse<DealPlayerCard>({
            handID: updatedActiveHand.handID,
            target: 'player',
            card: mockCard,
            points: playerPoints1,
          }),
        ],
      });

      const deck2 = this._gameStore.getDeck(roomID);
      const { card: card2, updatedDeck: updatedDeck2 } = CardsHandler.takeCardFromDeck(deck);
      this._gameStore.updateDeck({ roomID, deck: updatedDeck2 });
      const mockCard2 = { id: 'sjfajo;', suit: Suit.Clubs, value: CardValue.FOUR };
      const hand2 = this._gameStore.getHand({ roomID, playerID, handID: newHand.handID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID: newHand.handID,
        payload: { cards: ld.cloneDeep([...hand.cards, mockCard]) },
      });

      const { points: playerPoints2 } = this._gameStore.getHand({ roomID, playerID, handID: newHand.handID });

      await this._respondManager.respondWithDelay({
        roomID,
        event: 'dealPlayerCard',
        response: [
          successResponse<DealPlayerCard>({
            handID: newHand.handID,
            target: 'player',
            card: mockCard2,
            points: playerPoints2,
          }),
        ],
      });

    await this.checkDealerCombination({ roomID, playerID });
    } catch (error) {
      throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle split`);
    }
  }
  public async finishGame({ playerID, roomID }: SpecificID): Promise<void> {
    // try {
    //   this._gameStore.removeRoomFromStore(roomID);
    //   //   const roomMembers = io.sockets.adapter.rooms.get(roomID);
    //   //   if (roomMembers) {
    //   // roomMembers.delete(playerID);
    //   // io.sockets.adapter.rooms.set(roomID, roomMembers);
    //   //   }
    // } catch (error: unknown) {
    //   throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle game finish`);
    // }
  }
  public async handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: Bet }): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ roomID, playerID });
      this._gameStore.updateHand({ roomID, playerID, handID: player.activeHandID, payload: { bet } });
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
      const { activeHandID } = this._gameStore.getPlayer({ roomID, playerID });

      switch (response) {
        case YesNoAcknowledgement.Yes:
          //   await this.finishRoundForHand({ roomID, playerID, handID: activeHandID, result: GameResult.Win });
          await this.handleHandVictory({ roomID, playerID, coefficient: WinCoefficient['1:1'], handID: activeHandID });
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
      const player = this._gameStore.getPlayer({ roomID, playerID });

      await this.dealCards({ playerID, roomID });
      const isBlackjack = CardsHandler.isBlackjack({ roomID, playerID, store: this._gameStore });
      if (isBlackjack) {
        this.handleBlackjack({ roomID, playerID });
      } else {
        const proposeInsurance = CardsHandler.canPlaceInsurance({ roomID, playerID, store: this._gameStore });
        const canDouble = CardsHandler.canDouble({ roomID, playerID, store: this._gameStore });
        const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
        const availableActions = [Action.HIT, Action.STAND, Action.SURENDER];
        if (canDouble) {
          availableActions.push(Action.DOUBLE);
        }
        if (proposeInsurance) {
          availableActions.push(Action.Insurance);
        }
        if (canSplit) {
          availableActions.push(Action.Split);
        }
        this._gameStore.updatePlayer({
          roomID,
          playerID,
          payload: {
            availableActions,
          },
        });
        await this._respondManager.respondWithDelay({
          event: 'updateSession',
          roomID,
          response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
        });
        await this._respondManager.respond({
            roomID,
            event: 'makeDecision',
            response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
          });
        //     // availableActions.forEach((action) => {
        //     //   if (action === Action.Insurance) {
        //     //     this.notificate({ roomID, notification: InsuranceNotification });
        //     //   }
        //     //   if (action === Action.DOUBLE) {
        //     //     this.notificate({ roomID, notification: DoubleNotification });
        //     //   }
        //     // });
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to start play`);
    }
  }

  private async finishRound({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      this._gameStore.resetSession({ playerID, roomID });
      await this._respondManager.respond({
        event: 'finishRound',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      await this.startNewRound({ roomID, playerID });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle finish round`);
    }
  }
  private async startNewRound({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      const hand = initializeHand(playerID);
      this._gameStore.updatePlayer({roomID, playerID, payload: {
          hands: [hand],
          activeHandID: hand.handID,
          availableActions: [Action.Bet]
        }})
      await this._respondManager.respondWithDelay({
        roomID,
        event: 'initGame',
        response: [successResponse({ game: ld.cloneDeep(this._gameStore.getSession(roomID)), playerID })],
      });
    } catch (error) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle start new round`);
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
      const { activeHandID } = this._gameStore.getPlayer({ roomID, playerID });
      if (dealerCards.length === 1) {
        const [card] = dealerCards;
        switch (true) {
          case TenSet.has(card.value):
            await this.checkDealerCombination({ playerID, roomID });
            break;
          case MinorSet.has(card.value):
            // await this.finishRoundForHand({ roomID, playerID, handID: activeHandID, result: GameResult.Win });
            await this.handleHandVictory({
              playerID,
              roomID,
              coefficient: WinCoefficient['3:2'],
              handID: activeHandID,
            });
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
      const player = this._gameStore.getPlayer({ playerID, roomID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID: player.activeHandID,
        payload: {
          bet: player.bet * 2,
        },
      });
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

      const mockCard = { id: 'sjfajo;', suit: Suit.Clubs, value: CardValue.FOUR };
      const hand = this._gameStore.getHand({ roomID, playerID, handID: player.activeHandID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID: player.activeHandID,
        payload: { cards: ld.cloneDeep([...hand.cards, mockCard]) },
      });
      const updatedActiveHand = this._gameStore.getActiveHand({ roomID, playerID });

      await this._respondManager.respondWithDelay({
        roomID,
        event: 'dealPlayerCard',
        response: [
          successResponse<DealPlayerCard>({
            target: 'player',
            handID: player.activeHandID,
            card: mockCard,
            points: updatedActiveHand.points,
          }),
        ],
      });

      if (updatedActiveHand.points > TWENTY_ONE) {
        await this.handleHandLose({ playerID, roomID, handID: updatedActiveHand.handID });
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
          availableActions: [],
        },
      });
      await this._respondManager.respond({
        event: 'updateSession',
        roomID,
        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
      });
      await this.handleHandLose({ roomID, playerID, handID: player.activeHandID });
    } catch (error: unknown) {
      throw new Error(`Socket ${playerID}: Failed to handle surender`);
    }
  }

  private async handleHit({ playerID, roomID }: SpecificID): Promise<void> {
    try {
      const deck = this._gameStore.getDeck(roomID);
      const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
      this._gameStore.updateDeck({ roomID, deck: updatedDeck });
      const mockCard: Card = { id: 'dofs', suit: Suit.Clubs, value: CardValue.FOUR };

      const { handID, cards } = this._gameStore.getActiveHand({ roomID, playerID });
      this._gameStore.updateHand({
        roomID,
        playerID,
        handID,
        payload: {
          cards: ld.cloneDeep([...cards, mockCard]),
        },
      });

      const { points: playerPoints } = this._gameStore.getActiveHand({ roomID, playerID });

      await this._respondManager.respondWithDelay({
        roomID,
        event: 'dealPlayerCard',
        response: [
          successResponse<DealPlayerCard>({
            handID,
            target: 'player',
            card: mockCard,
            points: playerPoints,
          }),
        ],
      });

      const { hands } = this._gameStore.getPlayer({ roomID, playerID });
      const otherHands = hands.filter((hand) => hand.handID !== handID);
      switch (true) {
        case playerPoints === TWENTY_ONE:
          if (otherHands.every((hand) => hand.isStanding)) {
            await this.checkDealerCombination({ playerID, roomID });
          } else {
            await this.reassignActiveHand({ roomID, playerID });
            await this._respondManager.respond({
                roomID,
                event: 'makeDecision',
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
              });
          }
          break;
        case playerPoints > TWENTY_ONE:
          await this.handleHandLose({ playerID, roomID, handID });
          break;
        case playerPoints < TWENTY_ONE:
          // eslint-disable-next-line no-case-declarations
          const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
          // eslint-disable-next-line no-case-declarations
          const availableActions = [Action.HIT, Action.STAND];
          if (canSplit) {
            availableActions.push(Action.Split);
          }
          this._gameStore.updatePlayer({
            roomID,
            playerID,
            payload: { availableActions },
          });
          await this._respondManager.respondWithDelay({
            event: 'updateSession',
            roomID,
            response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
          });
          await this._respondManager.respond({
            roomID,
            event: 'makeDecision',
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

  private async checkDealerCombination({ playerID, roomID }: SpecificID): Promise<void> {
    try {
    //   this._gameStore.updatePlayer({
    //     playerID,
    //     roomID,
    //     payload: {
    //       availableActions: [],
    //     },
    //   });
    //   await this._respondManager.respond({
    //     event: 'updateSession',
    //     roomID,
    //     response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
    //   });
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
      const { insurance } = this._gameStore.getPlayer({ playerID, roomID });
      if (insurance > 0) {
        if (dealerPoints === TWENTY_ONE) {
          this.giveInsurance({ playerID, roomID });
        } else {
          this.takeOutInsurance({ playerID, roomID });
        }
      }

      await this.checkDealerForBlackjack({ playerID, roomID });
      await this.startDealerPlay({ roomID, playerID });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to check dealer's combination`);
    }
  }

  private async checkDealerForBlackjack({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      const { points: dealerPoints } = this._gameStore.getDealer(roomID);
      if (dealerPoints !== TWENTY_ONE) return;
      const { hands, activeHandID } = this._gameStore.getPlayer({ playerID, roomID });
      hands.forEach(async (hand) => {
        const playerPoints = hand.points;
        if (playerPoints === TWENTY_ONE) {
          await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient['even'], handID: hand.handID });
        } else {
          await this.handleHandLose({ playerID, roomID, handID: hand.handID });
        }
      });
    } catch (error) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to play with hand`);
    }
  }

  private async startDealerPlay({ roomID, playerID }: SpecificID): Promise<void> {
    try {
      let { points: dealerPoints } = this._gameStore.getDealer(roomID);
      while (dealerPoints < SEVENTEEN) {
        const deck = this._gameStore.getDeck(roomID);
        const { card, updatedDeck } = CardsHandler.takeCardFromDeck(deck);
        this._gameStore.updateDeck({ roomID, deck: updatedDeck });
        const mockCard = { id: 'sodjh', suit: Suit.Hearts, value: CardValue.FIVE };
        this._gameStore.updateDealer({ roomID, payload: { cards: [mockCard] } });
        dealerPoints = this._gameStore.getDealer(roomID).points;
        await this._respondManager.respondWithDelay({
          roomID,
          event: 'dealDealerCard',
          response: [
            successResponse<DealDealerCard>({
              target: 'dealer',
              card: mockCard,
              points: dealerPoints,
            }),
          ],
        });
      }
      const { hands } = this._gameStore.getPlayer({ playerID, roomID });
      for (let i = 0; i < hands.length; i++) {
        // this._gameStore.updatePlayer({
        //   roomID,
        //   playerID,
        //   payload: {
        //     activeHandID: hands[i].handID,
        //   },
        // });
        //   await this._respondManager.respond({
        //     event: 'reassignActiveHand',
        //     roomID,
        //     response: [successResponse<ReassignActiveHand>(ld.cloneDeep({ roomID, playerID, handID: hands[0].handID }))],
        //   });
        await this.playWithSingleHand({ roomID, playerID, id: hands[i].handID });
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to dealer's play`);
    }
  }
  private async playWithSingleHand({ roomID, playerID, id }: SpecificID & { id: string }): Promise<void> {
    try {
      const { points: dealerPoints } = this._gameStore.getDealer(roomID);
      const { points: playerPoints, handID } = this._gameStore.getHand({ roomID, playerID, handID: id });

      switch (true) {
        case dealerPoints >= SEVENTEEN && dealerPoints < TWENTY_ONE:
          if (playerPoints === TWENTY_ONE) {
            await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'], handID });
          } else {
            if (playerPoints === dealerPoints) {
              await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient['even'], handID });
            } else {
              if (playerPoints > dealerPoints) {
                await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient['1:1'], handID });
              } else {
                await this.handleHandLose({ playerID, roomID, handID });
              }
            }
          }
          break;
        case dealerPoints === TWENTY_ONE:
          if (playerPoints === TWENTY_ONE) {
            await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient['even'], handID });
          } else {
            await this.handleHandLose({ playerID, roomID, handID });
          }
          break;
        case dealerPoints > TWENTY_ONE:
          if (playerPoints === TWENTY_ONE) {
            await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient['3:2'], handID });
          } else {
            await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient['1:1'], handID });
          }
          break;
        default:
          throw new Error('Unreachable code');
      }
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to play with active hand`);
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
  private async handleHandVictory({
    coefficient,
    playerID,
    roomID,
    handID,
  }: SpecificID & { coefficient: number; handID: string }): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ playerID, roomID });
      const winAmount = player.bet + player.bet * coefficient;
      const updatedBalance = player.balance + winAmount;
      this._playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });
      this._gameStore.updatePlayer({ playerID, roomID, payload: { balance: updatedBalance, bet: 0 } });
      await this.finishRoundForHand({ roomID, playerID, handID, result: GameResult.Win });
    } catch (error: unknown) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle player's victory`);
    }
  }

  private async handleHandLose({ roomID, playerID, handID }: SpecificID & { handID: string }): Promise<void> {
    try {
      const player = this._gameStore.getPlayer({ playerID, roomID });
      console.log("player available actions: ", player.availableActions);
      const hand = this._gameStore.getHand({ roomID, playerID, handID });
      this._playersStore.updatePlayerBalance({ playerID, balance: player.balance });
      this._gameStore.updatePlayer({
        roomID,
        playerID,
        payload: {
          balance: player.balance,
          bet: player.bet - hand.bet,
        },
      });
      await this.finishRoundForHand({ roomID, playerID, handID, result: GameResult.Lose });
    } catch (e) {
      throw new Error(`Socket ${playerID}: Failed to handle player lose`);
    }
  }

  private async finishRoundForHand({
    roomID,
    playerID,
    handID,
    result,
  }: SpecificID & { handID: string; result: GameResult }): Promise<void> {
    try {
      this._gameStore.removeHand({ handID, playerID, roomID });

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

      const { hands } = this._gameStore.getPlayer({ playerID, roomID });
      console.log('HANDS LENGTH: ', hands.length);
      if (hands.length > 0) {
        // this._gameStore.reassignActiveHand({ roomID, playerID });
        this.reassignActiveHand({ roomID, playerID });
        await this._respondManager.respond({
          event: 'updateSession',
          roomID,
          response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
        });
      } else {
        await this.finishRound({ playerID, roomID });
      }
    } catch (error) {
      throw new Error(isError(error) ? error.message : `${playerID}: Failed to finish round for hand`);
    }
  }
  private async dealPlayerCard({ roomID, playerID }: SpecificID): Promise<void> {
    // const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    // this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    // this._gameStore.updatePlayer({
    //   playerID: playerID,
    //   roomID,
    //   payload: {
    //     cards: [card],
    //   },
    // });
    // await this._respondManager.respondWithDelay({
    //   roomID,
    //   event: 'dealCard',
    //   response: [
    //     successResponse<NewCard>({
    //       target: 'player',
    //       card,
    //       points: this._gameStore.getPlayer({ playerID, roomID }).points,
    //     }),
    //   ],
    // });
  }
  private async dealDealerCard(roomID: RoomID): Promise<void> {
    // const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    // this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    // this._gameStore.updateDealer({
    //   roomID,
    //   payload: {
    //     hasHoleCard: false,
    //     cards: [card],
    //   },
    // });
    // await this._respondManager.respondWithDelay({
    //   roomID,
    //   event: 'dealCard',
    //   response: [
    //     successResponse<NewCard>({
    //       target: 'dealer',
    //       card,
    //       points: this._gameStore.getDealer(roomID).points,
    //     }),
    //   ],
    // });
  }
  private async dealDealerHoleCard(roomID: RoomID): Promise<void> {
    // const { card, updatedDeck } = CardsHandler.takeCardFromDeck(this._gameStore.getDeck(roomID));
    // this._gameStore.updateDeck({ roomID, deck: updatedDeck });
    // this._gameStore.updateDealer({
    //   roomID,
    //   payload: {
    //     hasHoleCard: true,
    //     holeCard: card,
    //   },
    // });
    // await this._respondManager.respondWithDelay({
    //   roomID,
    //   event: 'dealCard',
    //   response: [
    //     successResponse<NewCard>({
    //       target: 'dealer',
    //       card: { id: 'hole' },
    //       points: this._gameStore.getDealer(roomID).points,
    //     }),
    //   ],
    // });
  }

  private async dealMockCards({ playerID, roomID }: SpecificID): Promise<void> {
    const player = this._gameStore.getPlayer({ playerID, roomID });
    const card1 = { id: '1sd23', suit: Suit.Clubs, value: CardValue.FOUR };

    this._gameStore.updateHand({
      playerID: player.playerID,
      roomID,
      handID: player.activeHandID,
      payload: {
        cards: [card1],
      },
    });

    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealPlayerCard',
      response: [
        successResponse<DealPlayerCard>({
          target: 'player',
          card: card1,
          handID: player.activeHandID,
          points: this._gameStore.getScore({ roomID, playerID, handID: player.activeHandID }),
        }),
      ],
    });

    const card2 = { id: '1faf', suit: Suit.Clubs, value: CardValue.TEN };
    this._gameStore.updateDealer({
      roomID,
      payload: {
        hasHoleCard: false,
        cards: [card2],
      },
    });
    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealDealerCard',
      response: [
        successResponse<DealDealerCard>({
          target: 'dealer',
          card: card2,
          points: this._gameStore.getDealer(roomID).points,
        }),
      ],
    });

    const card3 = { id: 'ghjr', suit: Suit.Clubs, value: CardValue.FOUR };
    this._gameStore.updateHand({
      playerID: player.playerID,
      roomID,
      handID: player.activeHandID,
      payload: {
        cards: [...this._gameStore.getActiveHand({ roomID, playerID }).cards, card3],
      },
    });

    await this._respondManager.respondWithDelay({
      roomID,
      event: 'dealPlayerCard',
      response: [
        successResponse<DealPlayerCard>({
          target: 'player',
          card: card3,
          handID: player.activeHandID,
          points: this._gameStore.getScore({ roomID, playerID, handID: player.activeHandID }),
        }),
      ],
    });

    const card4 = { id: 'wegtq', suit: Suit.Clubs, value: CardValue.SEVEN };
    this._gameStore.updateDealer({
      roomID,
      payload: {
        hasHoleCard: true,
        holeCard: card4,
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
