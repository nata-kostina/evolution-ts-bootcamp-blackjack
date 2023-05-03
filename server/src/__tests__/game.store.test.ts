import ld from "lodash";
import { Store } from "../store/game.store";
import {
    CardValue,
    Deck,
    GameSession,
    GameState,
    Hand,
    PlayerInstance,
    Suit,
    Action,
    DealerInstance,
    UpdateDealerParams,
} from "../types/index";
import { initializePlayer } from "../utils/initializers.js";

describe("Players' store", () => {
    const playerID = "123";
    const roomID = "456";
    let gameStore: Store;
    let mockPlayerInstance: PlayerInstance;
    let session: GameState;

    beforeEach(() => {
        gameStore = new Store();
        mockPlayerInstance = {
            activeHandID: "678",
            availableActions: [],
            balance: 1000,
            bet: 10,
            hands: [{
                bet: 10,
                cards: [],
                handID: "678",
                isStanding: false,
                parentID: playerID,
                points: [10],
            }],
            insurance: 0,
            playerID,
            roomID,
        };
        session = {
            deck: [],
            roomID,
            dealer: { cards: [], hasHoleCard: true, points: 10 },
            players: {
                [playerID]: mockPlayerInstance,
            },
        };
    });

    it("should update deck", () => {
        gameStore.game[roomID] = session;
        const mockDeck: Deck = [{ id: "123", suit: Suit.Clubs, value: CardValue.ACE }];

        const currentDeck = gameStore.game[roomID].deck;
        expect(currentDeck).toStrictEqual([]);

        gameStore.updateDeck({ roomID, deck: mockDeck });

        const updatedDeck = gameStore.game[roomID].deck;
        expect(updatedDeck).toStrictEqual(mockDeck);
    });

    it("should join player to the game state", () => {
        gameStore.game[roomID] = session;
        const expectedPlayer = initializePlayer({ playerID, roomID, balance: 1000 });

        gameStore.joinPlayerToGameState({ player: expectedPlayer, roomID });

        const actualPlayer = gameStore.game[roomID].players[playerID];

        expect(actualPlayer).toStrictEqual(expectedPlayer);
    });

    it("should get a game by room id", () => {
        gameStore.game[roomID] = session;

        const actualGame = gameStore.getGame(roomID);

        expect(actualGame).toStrictEqual(session);
    });

    it("should get a player by room id and player id", () => {
        gameStore.game[roomID] = session;

        const actualPlayer = gameStore.getPlayer({ roomID, playerID });

        expect(actualPlayer).toStrictEqual(mockPlayerInstance);
    });

    it("should remove room from store", () => {
        gameStore.game[roomID] = session;

        gameStore.removeRoomFromStore(roomID);

        expect(gameStore.game[roomID]).toBeUndefined();
    });

    it("should remove player from game", () => {
        gameStore.game[roomID] = session;

        gameStore.removePlayerFromGame({ roomID, playerID });

        const actualPlayer = gameStore.game[roomID].players[playerID];
        expect(actualPlayer).toBeUndefined();
    });

    it("should get game session", () => {
        gameStore.game[roomID] = session;
        const expectedGameSession: GameSession = {
            dealer: ld.cloneDeep(session.dealer),
            players: ld.cloneDeep(session.players),
            roomID,
        };

        const actualSession = gameStore.getSession(roomID);

        expect(actualSession).toStrictEqual(expectedGameSession);
    });

    it("should get deck", () => {
        const mockDeck: Deck = [{ id: "123", suit: Suit.Clubs, value: CardValue.ACE }];
        session.deck = mockDeck;
        gameStore.game[roomID] = session;
        const actualDeck = gameStore.getDeck(roomID);

        expect(actualDeck).toStrictEqual(mockDeck);
    });

    it("should get active hand", () => {
        const handID = "active-hand";
        const expectedHand: Hand = {
            parentID: playerID,
            handID,
            bet: 0,
            cards: [],
            isStanding: false,
            points: [0],
        };
        session.players[playerID].activeHandID = handID;
        session.players[playerID].hands = [expectedHand];
        gameStore.game[roomID] = session;

        const actualHand = gameStore.getActiveHand({ roomID, playerID });
        expect(actualHand).toStrictEqual(expectedHand);
    });

    it("should update player", () => {
        gameStore.game[roomID] = session;

        const mockPayload = {
            balance: 3000,
            bet: 75,
            insurance: 15,
            availableActions: [Action.Double],
            hands: [{
                parentID: playerID,
                handID: "active-hand",
                bet: 15,
                cards: [],
                isStanding: false,
                points: [0],
            }],
            activeHandID: "active-hand",
        };
        gameStore.updatePlayer({ roomID, playerID, payload: mockPayload });

        const player = gameStore.getPlayer({ roomID, playerID });

        expect(player.balance).toEqual(mockPayload.balance);
        expect(player.bet).toEqual(mockPayload.bet);
        expect(player.insurance).toEqual(mockPayload.insurance);
        expect(player.availableActions).toStrictEqual(mockPayload.availableActions);
        expect(player.hands).toEqual(mockPayload.hands);
        expect(player.activeHandID).toEqual(mockPayload.activeHandID);
    });

    it("should update hand", () => {
        const mockHand: Hand = {
            parentID: playerID,
            handID: "active-hand",
            bet: 15,
            cards: [],
            isStanding: false,
            points: [0],
        };
        mockPlayerInstance.hands = [mockHand];
        gameStore.game[roomID] = session;

        const mockPayload = {
            cards: [{ id: "card-id", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            bet: 85,
            isStanding: true,
            points: [8],
        };
        gameStore.updateHand({ roomID, playerID, handID: mockHand.handID, payload: mockPayload });

        const actualHand = gameStore.game[roomID].players[playerID].hands.find((hand) => hand.handID === mockHand.handID);

        expect(actualHand?.bet).toEqual(mockPayload.bet);
        expect(actualHand?.isStanding).toEqual(mockPayload.isStanding);
        expect(actualHand?.cards).toStrictEqual(mockPayload.cards);
        expect(actualHand?.points).toStrictEqual(mockPayload.points);
    });

    it("should get score", () => {
        const mockHand: Hand = {
            parentID: playerID,
            handID: "active-hand",
            bet: 15,
            cards: [{ id: "card-id", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            isStanding: false,
            points: [8],
        };
        mockPlayerInstance.hands = [mockHand];
        gameStore.game[roomID] = session;

        const actualScore = gameStore.getScore({ roomID, playerID, handID: mockHand.handID });
        expect(actualScore).toStrictEqual(mockHand.points);
    });

    it("should get hand", () => {
        const mockHand: Hand = {
            parentID: playerID,
            handID: "active-hand",
            bet: 15,
            cards: [{ id: "card-id", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            isStanding: false,
            points: [8],
        };
        mockPlayerInstance.hands = [mockHand];
        gameStore.game[roomID] = session;

        const actualHand = gameStore.getHand({ roomID, playerID, handID: mockHand.handID });
        expect(actualHand).toStrictEqual(mockHand);
    });

    it("should get dealer", () => {
        const mockDealer: DealerInstance = {
            cards: [{ id: "card-id", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            hasHoleCard: false,
            points: 8,
        };
        session.dealer = mockDealer;
        gameStore.game[roomID] = session;

        const actualDealer = gameStore.getDealer(roomID);
        expect(actualDealer).toStrictEqual(mockDealer);
    });

    it("should update dealer", () => {
        const payload: UpdateDealerParams["payload"] = {
            cards: [{ id: "card-id-1", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            hasHoleCard: true,
            points: 8,
            holeCard: { id: "card-id-2", value: CardValue.SIX, suit: Suit.Diamonds },
        };
        gameStore.game[roomID] = session;

        gameStore.updateDealer({ roomID, payload });

        const actualDealer = gameStore.game[roomID].dealer;
        expect(actualDealer.cards).toStrictEqual(payload.cards);
        expect(actualDealer.holeCard).toStrictEqual(payload.holeCard);
        expect(actualDealer.hasHoleCard).toBe(payload.hasHoleCard);
        expect(actualDealer.points).toBe(payload.points);
    });

    it("should open dealer's secret card", () => {
        const card = { id: "card-id-1", value: CardValue.EIGHT, suit: Suit.Diamonds };
        const holedCard = { id: "card-id-2", value: CardValue.SIX, suit: Suit.Diamonds };

        const mockDealer: DealerInstance = {
            cards: [card],
            hasHoleCard: true,
            points: 8,
            holeCard: holedCard,
        };
        session.dealer = mockDealer;
        gameStore.game[roomID] = session;

        gameStore.unholeCard(roomID);
        const actualDealer = gameStore.game[roomID].dealer;

        expect(actualDealer.hasHoleCard).toBe(false);
        expect(actualDealer.holeCard).toBeUndefined();
        expect(actualDealer.cards).toStrictEqual([card, holedCard]);
    });

    it("should reset player", () => {
        gameStore.game[roomID] = session;
        gameStore.resetPlayer({ roomID, playerID });

        const actualPlayer = gameStore.game[roomID].players[playerID];

        expect(actualPlayer.activeHandID).toBe("");
        expect(actualPlayer.availableActions).toStrictEqual([]);
        expect(actualPlayer.balance).toBe(mockPlayerInstance.balance);
        expect(actualPlayer.bet).toBe(0);
        expect(actualPlayer.hands).toStrictEqual([]);
        expect(actualPlayer.insurance).toBe(0);
    });

    it("should reset dealer", () => {
        gameStore.game[roomID] = session;
        gameStore.resetDealer(roomID);

        const actualDealer = gameStore.game[roomID].dealer;

        expect(actualDealer.cards).toStrictEqual([]);
        expect(actualDealer.hasHoleCard).toBe(false);
        expect(actualDealer.holeCard).toBeUndefined();
    });

    it("should reset game session", () => {
        gameStore.game[roomID] = session;
        gameStore.resetSession({ roomID, playerID });
        const actualDealer = gameStore.game[roomID].dealer;

        expect(actualDealer.cards).toStrictEqual([]);
        expect(actualDealer.hasHoleCard).toBe(false);
        expect(actualDealer.holeCard).toBeUndefined();

        const actualPlayer = gameStore.game[roomID].players[playerID];

        expect(actualPlayer.activeHandID).toBe("");
        expect(actualPlayer.availableActions).toStrictEqual([]);
        expect(actualPlayer.balance).toBe(mockPlayerInstance.balance);
        expect(actualPlayer.bet).toBe(0);
        expect(actualPlayer.hands).toStrictEqual([]);
        expect(actualPlayer.insurance).toBe(0);
    });

    it("should get reset game session", () => {
        gameStore.game[roomID] = session;
        gameStore.resetSession({ roomID, playerID });
        const actualDealer = gameStore.game[roomID].dealer;

        expect(actualDealer.cards).toStrictEqual([]);
        expect(actualDealer.hasHoleCard).toBe(false);
        expect(actualDealer.holeCard).toBeUndefined();

        const actualPlayer = gameStore.game[roomID].players[playerID];

        expect(actualPlayer.activeHandID).toBe("");
        expect(actualPlayer.availableActions).toStrictEqual([]);
        expect(actualPlayer.balance).toBe(mockPlayerInstance.balance);
        expect(actualPlayer.bet).toBe(0);
        expect(actualPlayer.hands).toStrictEqual([]);
        expect(actualPlayer.insurance).toBe(0);
    });

    it("should reassign active hand", () => {
        const mockHand: Hand = {
            parentID: playerID,
            handID: "active-hand",
            bet: 15,
            cards: [{ id: "card-id", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            isStanding: false,
            points: [8],
        };
        const mockNewHand: Hand = {
            parentID: mockHand.handID,
            handID: "new-active-hand",
            bet: 15,
            cards: [{ id: "card-id", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            isStanding: false,
            points: [8],
        };
        mockPlayerInstance.activeHandID = mockHand.handID;
        mockPlayerInstance.hands = [mockHand, mockNewHand];
        gameStore.game[roomID] = session;

        gameStore.reassignActiveHand({ roomID, playerID });
        const actualActiveHand = gameStore.getActiveHand({ roomID, playerID });

        expect(actualActiveHand.handID).toBe(mockNewHand.handID);
    });

    it("should remove hand", () => {
        const mockHand: Hand = {
            parentID: playerID,
            handID: "active-hand",
            bet: 15,
            cards: [{ id: "card-id", value: CardValue.EIGHT, suit: Suit.Diamonds }],
            isStanding: false,
            points: [8],
        };

        mockPlayerInstance.activeHandID = mockHand.handID;
        mockPlayerInstance.hands = [mockHand];
        gameStore.game[roomID] = session;

        gameStore.removeHand({ roomID, playerID, handID: mockHand.handID });
        const actualPlayer = gameStore.game[roomID].players[playerID];
        const actualHand = actualPlayer.hands.find((hand) => hand.handID === "active-hand");

        expect(actualHand).toBeUndefined();
    });
});
