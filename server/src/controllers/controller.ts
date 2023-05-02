import ld from "lodash";
import { Socket } from "socket.io";
import { initializePlayer, initializeHand } from "../utils/initializers.js";
import { successResponse } from "../utils/successResponse.js";
import { isError } from "../utils/isError.js";
import { assertUnreachable } from "../utils/assertUnreachable.js";
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
    UnholeCardPayload,
    WinCoefficient,
    YesNoAcknowledgement,
    Action,
    DealPlayerCard,
    DealDealerCard,
    GameResult,
    ReassignActiveHand,
    Seat,
    Suit,
} from "../types/index.js";
import { IResponseManager } from "../utils/responseManager.js";
import {
    BlackjackNotification,
    defaultBalance,
    MinorSet,
    PointsMap,
    SEVENTEEN,
    TakeMoneyNotification,
    TenSet,
    TWENTY_ONE,
} from "../constants/index.js";
import { CardsHandler } from "../utils/CardsHandler.js";
import { generatePlayerID } from "../utils/generatePlayerID.js";

export class SinglePlayerController implements Controller {
    private readonly _playersStore: IPlayersStore;
    private readonly _gameStore: IStore;
    private readonly _respondManager: IResponseManager;
    private _isDebugMode = false;

    public constructor(playersStore: IPlayersStore, gameStore: IStore, respondManager: IResponseManager) {
        this._playersStore = playersStore;
        this._gameStore = gameStore;
        this._respondManager = respondManager;
    }

    public async handleInitGame({ playerID, socket, debug }: {
        playerID: PlayerID;
        socket: Socket;
        debug: boolean;
    }): Promise<void> {
        try {
            this._isDebugMode = debug;
            const id = playerID || generatePlayerID();
            const roomID = this._gameStore.createNewRoom();

            const socketRooms = socket.rooms;
            for (const room of socketRooms) {
                if (room.startsWith("Room_id_")) {
                    await socket.leave(room);
                }
            }

            await socket.join(roomID);

            if (this._playersStore.isNewPlayer(id)) {
                this._playersStore.updatePlayerBalance({ playerID: id, balance: defaultBalance });
            }

            const player = initializePlayer({
                playerID: id,
                roomID,
                balance: this._playersStore.getPlayerBalance(id),
            });

            this._gameStore.joinPlayerToGameState({ roomID, player });

            const availableSeats = this._gameStore.getAvailableSeat(roomID);

            await this._respondManager.respondWithDelay({
                roomID,
                event: "initGame",
                response: [
                    successResponse({ game: ld.cloneDeep(this._gameStore.getSession(roomID)), playerID: id, availableSeats }),
                ],
            });
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle game start`);
        }
    }

    public handleChooseSeat({ roomID, playerID, seat }: SpecificID & { seat: Seat; }): void {
        try {
            this._gameStore.updatePlayer({
                roomID,
                playerID,
                payload: {
                    seat,
                },
            });
            this._respondManager.respond({
                event: "updateSession",
                roomID,
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to handle choose seat`);
        }
    }

    public async handleDecision({ roomID, playerID, action }: SpecificID & { action: Action; }): Promise<void> {
        try {
            switch (action) {
                case Action.Double:
                    await this.handleDouble({ roomID, playerID });
                    break;
                case Action.Surrender:
                    await this.handleSurrender({ roomID, playerID });
                    break;
                case Action.Hit:
                    await this.handleHit({ roomID, playerID });
                    break;
                case Action.Stand:
                    await this.handleStand({ roomID, playerID });
                    break;
                case Action.Insurance:
                    this.placeInsurance({ roomID, playerID });
                    break;
                case Action.Split:
                    await this.handleSplit({ roomID, playerID });
                    break;
                case Action.SkipInsurance:
                    this.handleSkipInsurance({ roomID, playerID });
                    break;
                case Action.Bet:
                    break;
                default:
                    assertUnreachable(action);
            }
        } catch (error) {
            throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle player decision`);
        }
    }

    public async handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: Bet; }): Promise<void> {
        try {
            const player = this._gameStore.getPlayer({ roomID, playerID });
            this._gameStore.updateHand({ roomID, playerID, handID: player.activeHandID, payload: { bet } });
            this._gameStore.updatePlayer({ roomID, playerID, payload: { bet, balance: player.balance - bet } });
            await this._respondManager.respondWithDelay({
                roomID,
                event: "placeBet",
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle placing bet`);
        }
    }

    public async handleTakeMoneyDecision({
        playerID,
        roomID,
        response,
    }: SpecificID & { response: YesNoAcknowledgement; }): Promise<void> {
        try {
            const { activeHandID } = this._gameStore.getPlayer({ roomID, playerID });

            switch (response) {
                case YesNoAcknowledgement.Yes:
                    await this.handleHandVictory({ roomID, playerID, coefficient: WinCoefficient["1:1"], handID: activeHandID });
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
            await this.dealCards({ playerID, roomID });
            const isBlackjack = CardsHandler.isBlackjack({ roomID, playerID, store: this._gameStore });
            if (isBlackjack) {
                await this.handleBlackjack({ roomID, playerID });
            } else {
                const proposeInsurance = CardsHandler.canPlaceInsurance({ roomID, playerID, store: this._gameStore });
                const availableActions: Array<Action> = [];
                if (proposeInsurance) {
                    availableActions.push(Action.Insurance);
                    availableActions.push(Action.SkipInsurance);
                } else {
                    const actions = this.getAvailableActions({ roomID, playerID });
                    availableActions.push(...actions);
                }
                this._gameStore.updatePlayer({
                    roomID,
                    playerID,
                    payload: {
                        availableActions,
                    },
                });
                this._respondManager.respond({
                    event: "updateSession",
                    roomID,
                    response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                });
                this._respondManager.respond({
                    roomID,
                    event: "makeDecision",
                    response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                });
            }
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to start play`);
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
                this.reassignActiveHand({ roomID, playerID });
                const availableActions = [Action.Hit, Action.Stand];
                const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
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
                this._respondManager.respond({
                    event: "updateSession",
                    roomID,
                    response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                });
                this._respondManager.respond({
                    roomID,
                    event: "makeDecision",
                    response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                });
            }
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle stand`);
        }
    }

    private async handleSplit({ roomID, playerID }: SpecificID): Promise<void> {
        try {
            if (!CardsHandler.canSplit({ roomID, playerID, store: this._gameStore })) { return; }
            const activeHand = this._gameStore.getActiveHand({ roomID, playerID });
            if (activeHand.cards.length !== 2) { return; }

            const [firstCard, secondCard] = activeHand.cards;
            if (firstCard.value === CardValue.ACE) {
                await this.handleSplitAces({ roomID, playerID });
                return;
            }

            const { bet, balance, activeHandID } = this._gameStore.getPlayer({ roomID, playerID });
            this._gameStore.updateHand({
                roomID,
                playerID,
                handID: activeHand.handID,
                payload: {
                    cards: [firstCard],
                },
            });

            const newHand = initializeHand(activeHand.handID);
            newHand.bet = bet;
            newHand.cards = [secondCard];
            newHand.points = [PointsMap[secondCard.value]];

            const availableActions = [Action.Hit, Action.Stand];

            const player = this._gameStore.getPlayer({ roomID, playerID });

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
                event: "split",
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });

            await this.dealPlayerCard({ roomID, playerID });
            this.reassignActiveHand({ roomID, playerID });
            await this.dealPlayerCard({ roomID, playerID });
            this._gameStore.updatePlayer({
                roomID,
                playerID,
                payload: {
                    activeHandID: activeHandID,
                },
            });
            this._respondManager.respond({
                event: "reassignActiveHand",
                roomID,
                response: [successResponse<ReassignActiveHand>(ld.cloneDeep({ roomID, playerID, handID: activeHandID }))],
            });

            await this._respondManager.respondWithDelay({
                roomID,
                event: "makeDecision",
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
        } catch (error) {
            throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle split`);
        }
    }

    private async handleSplitAces({ playerID, roomID }: SpecificID): Promise<void> {
        try {
            const activeHand = this._gameStore.getActiveHand({ roomID, playerID });
            const [firstCard, secondCard] = activeHand.cards;
            if (firstCard.value !== CardValue.ACE || secondCard.value !== CardValue.ACE) {
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
            newHand.points = [PointsMap[secondCard.value]];

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
                event: "split",
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });

            await this.dealPlayerCard({ roomID, playerID });
            this.reassignActiveHand({ roomID, playerID });
            await this.dealPlayerCard({ roomID, playerID });
            await this.checkDealerCombination({ roomID, playerID });
        } catch (error) {
            throw new Error(isError(error) ? error.message : `Player ${playerID}: Failed to handle split`);
        }
    }

    private finishRound({ playerID, roomID }: SpecificID): void {
        try {
            this._gameStore.resetSession({ playerID, roomID });
            this._respondManager.respond({
                event: "finishRound",
                roomID,
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
            this.startNewRound({ roomID, playerID });
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle finish round`);
        }
    }

    private startNewRound({ roomID, playerID }: SpecificID): void {
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

            this._respondManager.respond({
                roomID,
                event: "updateSession",
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
        } catch (error) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle start new round`);
        }
    }

    private async notificate({ roomID, notification }: { roomID: RoomID; notification: Notification; }): Promise<void> {
        await this._respondManager.respondWithDelay({
            roomID,
            event: "notificate",
            response: [successResponse<Notification>(notification)],
        });
    }

    private async dealCards({ playerID, roomID }: SpecificID): Promise<void> {
        try {
            if (this._isDebugMode) {
                await this.dealMockCards({ roomID, playerID });
            } else {
                await this.dealPlayerCard({ roomID, playerID });
                await this.dealDealerCard(roomID);
                await this.dealPlayerCard({ roomID, playerID });
                await this.dealDealerHoleCard(roomID);
            }
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to deal cards`);
        }
    }

    private async handleBlackjack({ playerID, roomID }: SpecificID): Promise<void> {
        try {
            await this.notificate({ roomID, notification: BlackjackNotification });
            const { cards: dealerCards } = this._gameStore.getDealer(roomID);
            const { activeHandID } = this._gameStore.getPlayer({ roomID, playerID });
            if (dealerCards.length === 1) {
                const [card] = dealerCards;
                switch (true) {
                    case TenSet.has(card.value):
                        await this.checkDealerCombination({ playerID, roomID });
                        break;
                    case MinorSet.has(card.value):
                        await this.handleHandVictory({
                            playerID,
                            roomID,
                            coefficient: WinCoefficient["3:2"],
                            handID: activeHandID,
                        });
                        break;
                    case card.value === CardValue.ACE:
                        await this.notificate({ notification: TakeMoneyNotification, roomID });
                        break;
                    default:
                        throw new Error("Unreachable code");
                }
            } else {
                throw new Error(`${playerID}: Failed to handle blackjack`);
            }
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle blackjack`);
        }
    }

    private placeInsurance({ playerID, roomID }: SpecificID): void {
        try {
            const { balance, bet } = this._gameStore.getPlayer({ playerID, roomID });
            const insurance = bet / 2;
            const availableActions = this.getAvailableActions({ roomID, playerID });
            this._gameStore.updatePlayer({
                roomID,
                playerID,
                payload: {
                    balance: balance - insurance,
                    insurance,
                    availableActions: availableActions,
                },
            });
            this._respondManager.respond({
                event: "updateSession",
                roomID,
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
            this._respondManager.respond({
                roomID,
                event: "makeDecision",
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
                event: "updateSession",
                roomID,
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });

            await this.dealPlayerCard({ roomID, playerID });
            const updatedActiveHand = this._gameStore.getActiveHand({ roomID, playerID });

            if (Math.min(...updatedActiveHand.points) > TWENTY_ONE) {
                await this.handleHandLose({ playerID, roomID, handID: updatedActiveHand.handID });
            } else {
                await this.checkDealerCombination({ playerID, roomID });
            }
        } catch (error: unknown) {
            throw new Error(`Socket ${playerID}: Failed to handle double`);
        }
    }

    private async handleSurrender({ playerID, roomID }: SpecificID): Promise<void> {
        try {
            const player = this._gameStore.getPlayer({ playerID, roomID });
            const updatedBalance = player.balance + player.bet / 2;
            this._playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });
            this._gameStore.updatePlayer({
                roomID,
                playerID,
                payload: {
                    balance: updatedBalance,
                    bet: 0,
                },
            });
            this._gameStore.updateHand({
                roomID,
                playerID,
                handID: player.activeHandID,
                payload: {
                    bet: 0,
                },
            });
            await this.finishRoundForHand({ roomID, playerID, handID: player.activeHandID, result: GameResult.Win });
        } catch (error: unknown) {
            throw new Error(`Socket ${playerID}: Failed to handle surrender`);
        }
    }

    private async handleHit({ playerID, roomID }: SpecificID): Promise<void> {
        try {
            await this.dealPlayerCard({ roomID, playerID });
            const player = this._gameStore.getPlayer({ playerID, roomID });
            const playerPoints = this._gameStore.getScore({ roomID, playerID, handID: player.activeHandID });

            const { hands } = this._gameStore.getPlayer({ roomID, playerID });
            const otherHands = hands.filter((hand) => hand.handID !== player.activeHandID);
            switch (true) {
                case playerPoints.filter((points) => points === TWENTY_ONE).length > 0:
                    this._gameStore.updateHand({
                        roomID,
                        playerID,
                        handID: player.activeHandID,
                        payload: {
                            isStanding: true,
                        },
                    });

                    if (otherHands.length === 0 || (otherHands.length > 0 && otherHands.every((hand) => hand.isStanding))) {
                        await this.checkDealerCombination({ playerID, roomID });
                    } else {
                        this.reassignActiveHand({ roomID, playerID });
                        this._respondManager.respond({
                            roomID,
                            event: "makeDecision",
                            response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                        });
                    }
                    break;
                case Math.min(...playerPoints) > TWENTY_ONE:
                    await this.handleHandLose({ playerID, roomID, handID: player.activeHandID });
                    if (otherHands.length > 0 && otherHands.every((hand) => hand.isStanding)) {
                        this.reassignActiveHand({ roomID, playerID });
                        await this.checkDealerCombination({ playerID, roomID });
                    }
                    break;
                case Math.min(...playerPoints) < TWENTY_ONE:
                    // eslint-disable-next-line no-case-declarations
                    const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
                    // eslint-disable-next-line no-case-declarations
                    const availableActions = [Action.Hit, Action.Stand];
                    if (canSplit) {
                        availableActions.push(Action.Split);
                    }
                    this._gameStore.updatePlayer({
                        roomID,
                        playerID,
                        payload: { availableActions },
                    });
                    await this._respondManager.respondWithDelay({
                        event: "updateSession",
                        roomID,
                        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                    });
                    this._respondManager.respond({
                        roomID,
                        event: "makeDecision",
                        response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                    });
                    break;
                default:
                    throw new Error("Unreachable code");
            }
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle Hit`);
        }
    }

    private reassignActiveHand({ playerID, roomID }: SpecificID): void {
        try {
            this._gameStore.reassignActiveHand({ playerID, roomID });
            const { activeHandID } = this._gameStore.getPlayer({ roomID, playerID });
            this._respondManager.respond({
                event: "reassignActiveHand",
                roomID,
                response: [successResponse<ReassignActiveHand>(ld.cloneDeep({ roomID, playerID, handID: activeHandID }))],
            });
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle hands`);
        }
    }

    private async checkDealerCombination({ playerID, roomID }: SpecificID): Promise<void> {
        try {
            const { holeCard } = this._gameStore.getDealer(roomID);
            this._gameStore.unholeCard(roomID);
            const { points: dealerPoints } = this._gameStore.getDealer(roomID);
            if (holeCard) {
                await this._respondManager.respondWithDelay({
                    roomID,
                    event: "unholeCard",
                    response: [
                        successResponse<UnholeCardPayload>({
                            target: "dealer",
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
            if (dealerPoints !== TWENTY_ONE) { return; }
            const { hands } = this._gameStore.getPlayer({ playerID, roomID });
            const pendingChecks = hands.map((hand) => {
                const playerPoints = hand.points;
                if (playerPoints.filter((points) => points === TWENTY_ONE).length > 0) {
                    return this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient.even, handID: hand.handID });
                }
                return this.handleHandLose({ playerID, roomID, handID: hand.handID });
            });
            await Promise.all(pendingChecks);
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
                this._gameStore.updateDealer({ roomID, payload: { cards: [card] } });
                dealerPoints = this._gameStore.getDealer(roomID).points;
                await this._respondManager.respondWithDelay({
                    roomID,
                    event: "dealDealerCard",
                    response: [
                        successResponse<DealDealerCard>({
                            target: "dealer",
                            card,
                            points: dealerPoints,
                        }),
                    ],
                });
            }
            const { hands } = this._gameStore.getPlayer({ playerID, roomID });
            for (const hand of hands) {
                await this.playWithSingleHand({ roomID, playerID, id: hand.handID });
            }
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to dealer's play`);
        }
    }

    private async playWithSingleHand({ roomID, playerID, id }: SpecificID & { id: string; }): Promise<void> {
        try {
            const { points: dealerPoints } = this._gameStore.getDealer(roomID);
            const { points: playerPoints, handID } = this._gameStore.getHand({ roomID, playerID, handID: id });

            switch (true) {
                case dealerPoints >= SEVENTEEN && dealerPoints < TWENTY_ONE:
                    if (Math.max(...playerPoints) === TWENTY_ONE) {
                        await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient["3:2"], handID });
                    } else if (Math.max(...playerPoints) === dealerPoints) {
                        await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient.even, handID });
                    } else if (Math.max(...playerPoints) > dealerPoints) {
                        await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient["1:1"], handID });
                    } else {
                        await this.handleHandLose({ playerID, roomID, handID });
                    }
                    break;
                case dealerPoints === TWENTY_ONE:
                    if (Math.max(...playerPoints) === TWENTY_ONE) {
                        await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient.even, handID });
                    } else {
                        await this.handleHandLose({ playerID, roomID, handID });
                    }
                    break;
                case dealerPoints > TWENTY_ONE:
                    if (Math.max(...playerPoints) === TWENTY_ONE) {
                        await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient["3:2"], handID });
                    } else {
                        await this.handleHandVictory({ playerID, roomID, coefficient: WinCoefficient["1:1"], handID });
                    }
                    break;
                default:
                    throw new Error("Unreachable code");
            }
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `Socket ${playerID}: Failed to play with active hand`);
        }
    }

    private getAvailableActions({ playerID, roomID }: SpecificID): Action[] {
        try {
            const availableActions = [Action.Hit, Action.Stand, Action.Surrender];
            const canDouble = CardsHandler.canDouble({ roomID, playerID, store: this._gameStore });
            const canSplit = CardsHandler.canSplit({ roomID, playerID, store: this._gameStore });
            if (canDouble) {
                availableActions.push(Action.Double);
            }

            if (canSplit) {
                availableActions.push(Action.Split);
            }

            return availableActions;
        } catch (error) {
            throw new Error(`Socket ${playerID}: Failed to get available actions`);
        }
    }

    private handleSkipInsurance({ playerID, roomID }: SpecificID): void {
        try {
            const availableActions = this.getAvailableActions({ roomID, playerID });

            this._gameStore.updatePlayer({
                roomID,
                playerID,
                payload: {
                    availableActions,
                },
            });
            this._respondManager.respond({
                event: "updateSession",
                roomID,
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
            this._respondManager.respond({
                roomID,
                event: "makeDecision",
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
        } catch (error) {
            throw new Error(`Socket ${playerID}: Failed to skip insurance`);
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
    }: SpecificID & { coefficient: number; handID: string; }): Promise<void> {
        try {
            const player = this._gameStore.getPlayer({ playerID, roomID });
            const { bet } = this._gameStore.getHand({ roomID, playerID, handID });

            const winAmount = bet + bet * coefficient;
            const updatedBalance = player.balance + winAmount;
            this._playersStore.updatePlayerBalance({ playerID, balance: updatedBalance });
            this._gameStore.updatePlayer({ playerID, roomID, payload: { balance: updatedBalance, bet: player.bet - bet } });
            this._respondManager.respond({
                event: "updateSession",
                roomID,
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
            });
            await this.finishRoundForHand({ roomID, playerID, handID, result: GameResult.Win });
        } catch (error: unknown) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to handle player's victory`);
        }
    }

    private async handleHandLose({ roomID, playerID, handID }: SpecificID & { handID: string; }): Promise<void> {
        try {
            const player = this._gameStore.getPlayer({ playerID, roomID });
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
            this._respondManager.respond({
                event: "updateSession",
                roomID,
                response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
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
    }: SpecificID & { handID: string; result: GameResult; }): Promise<void> {
        try {
            this._gameStore.removeHand({ handID, playerID, roomID });

            await this._respondManager.respondWithDelay({
                event: "finishRoundForHand",
                roomID,
                response: [successResponse({ roomID, playerID, handID, result })],
                delay: 2500,
            });

            const { hands } = this._gameStore.getPlayer({ playerID, roomID });
            if (hands.length > 0) {
                this.reassignActiveHand({ roomID, playerID });
                this._respondManager.respond({
                    event: "updateSession",
                    roomID,
                    response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                });
                this._respondManager.respond({
                    roomID,
                    event: "makeDecision",
                    response: [successResponse<GameSession>(ld.cloneDeep(this._gameStore.getSession(roomID)))],
                });
            } else {
                this.finishRound({ playerID, roomID });
            }
        } catch (error) {
            throw new Error(isError(error) ? error.message : `${playerID}: Failed to finish round for hand`);
        }
    }

    private async dealPlayerCard({ roomID, playerID }: SpecificID): Promise<void> {
        const player = this._gameStore.getPlayer({ playerID, roomID });
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
            event: "dealPlayerCard",
            response: [
                successResponse<DealPlayerCard>({
                    target: "player",
                    card,
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
            event: "dealDealerCard",
            response: [
                successResponse<DealDealerCard>({
                    target: "dealer",
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
            event: "dealDealerCard",
            response: [
                successResponse<DealDealerCard>({
                    target: "dealer",
                    card: { id: "hole" },
                    points: this._gameStore.getDealer(roomID).points,
                }),
            ],
        });
    }

    private async dealMockCards({ playerID, roomID }: SpecificID): Promise<void> {
        const player = this._gameStore.getPlayer({ playerID, roomID });
        const card1 = { id: "1sd23", suit: Suit.Clubs, value: CardValue.FOUR };

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
            event: "dealPlayerCard",
            response: [
                successResponse<DealPlayerCard>({
                    target: "player",
                    card: card1,
                    handID: player.activeHandID,
                    points: this._gameStore.getScore({ roomID, playerID, handID: player.activeHandID }),
                    playerID,
                }),
            ],
        });

        const card2 = { id: "1faf", suit: Suit.Clubs, value: CardValue.ACE };
        this._gameStore.updateDealer({
            roomID,
            payload: {
                hasHoleCard: false,
                cards: [card2],
            },
        });
        await this._respondManager.respondWithDelay({
            roomID,
            event: "dealDealerCard",
            response: [
                successResponse<DealDealerCard>({
                    target: "dealer",
                    card: card2,
                    points: this._gameStore.getDealer(roomID).points,
                }),
            ],
        });

        const card3 = { id: "ghjr", suit: Suit.Clubs, value: CardValue.FOUR };
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
            event: "dealPlayerCard",
            response: [
                successResponse<DealPlayerCard>({
                    target: "player",
                    card: card3,
                    handID: player.activeHandID,
                    points: this._gameStore.getScore({ roomID, playerID, handID: player.activeHandID }),
                    playerID,
                }),
            ],
        });

        const card4 = { id: "wegtq", suit: Suit.Clubs, value: CardValue.SEVEN };
        this._gameStore.updateDealer({
            roomID,
            payload: {
                hasHoleCard: true,
                holeCard: card4,
            },
        });
        await this._respondManager.respondWithDelay({
            roomID,
            event: "dealDealerCard",
            response: [
                successResponse<DealDealerCard>({
                    target: "dealer",
                    card: { id: "hole" },
                    points: this._gameStore.getDealer(roomID).points,
                }),
            ],
        });
    }
}
