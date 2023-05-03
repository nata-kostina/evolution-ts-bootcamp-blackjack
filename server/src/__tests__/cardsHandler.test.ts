import { Store } from "../store/game.store";
import { Deck, Suit, CardValue, GameState, PlayerInstance, Hand, DealerInstance } from "../types";
import { CardsHandler } from "../utils/CardsHandler";

describe("Cards Handler", () => {
    const playerID = "123";
    const roomID = "456";
    let gameStore: Store;
    let mockPlayerInstance: PlayerInstance;
    let mockDealer: DealerInstance;
    let session: GameState;
    let mockHand: Hand;
    beforeEach(() => {
        gameStore = new Store();
        mockDealer = { cards: [], hasHoleCard: false, points: 0 };
        mockHand = {
            parentID: playerID,
            handID: "active-hand",
            bet: 10,
            cards: [],
            isStanding: false,
            points: [0],
        };
        mockPlayerInstance = {
            activeHandID: mockHand.handID,
            availableActions: [],
            balance: 1000,
            bet: 10,
            hands: [mockHand],
            insurance: 0,
            playerID,
            roomID,
        };
        session = {
            deck: [],
            roomID,
            dealer: mockDealer,
            players: {
                [playerID]: mockPlayerInstance,
            },
        };
    });
    it("should take a card from the deck", () => {
        const mockCard = { id: "123", suit: Suit.Clubs, value: CardValue.ACE };
        const mockDeck: Deck = [mockCard];

        const { card, updatedDeck } = CardsHandler.takeCardFromDeck(mockDeck);

        expect(card).toStrictEqual(mockCard);
        expect(updatedDeck).toStrictEqual([]);
    });

    it("should determine if the player has blackjack", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Diamonds, value: CardValue.ACE }];
        gameStore.game[roomID] = session;

        const isBlackjack = CardsHandler.isBlackjack({ store: gameStore, roomID, playerID });

        expect(isBlackjack).toBe(true);
    });

    it("should determine if the player has blackjack", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Diamonds, value: CardValue.EIGHT }];
        gameStore.game[roomID] = session;

        const isBlackjack = CardsHandler.isBlackjack({ store: gameStore, roomID, playerID });

        expect(isBlackjack).toBe(false);
    });

    it("should determine if the player can double", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Diamonds, value: CardValue.ACE }];
        gameStore.game[roomID] = session;

        const canDouble = CardsHandler.canDouble({ store: gameStore, roomID, playerID });

        expect(canDouble).toBe(true);
    });

    it("should determine if the player can't double", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Diamonds, value: CardValue.EIGHT },
            { id: "3", suit: Suit.Hearts, value: CardValue.EIGHT }];
        gameStore.game[roomID] = session;

        const canDouble = CardsHandler.canDouble({ store: gameStore, roomID, playerID });

        expect(canDouble).toBe(false);
    });

    it("should determine if the player can split", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TWO },
            { id: "2", suit: Suit.Hearts, value: CardValue.TWO }];
        gameStore.game[roomID] = session;

        const canSplit = CardsHandler.canSplit({ store: gameStore, roomID, playerID });

        expect(canSplit).toBe(true);
    });

    it("should determine if the player can split", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Hearts, value: CardValue.Q }];
        gameStore.game[roomID] = session;

        const canSplit = CardsHandler.canSplit({ store: gameStore, roomID, playerID });

        expect(canSplit).toBe(true);
    });

    it("should determine if the player can split", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.K },
            { id: "2", suit: Suit.Hearts, value: CardValue.J }];
        gameStore.game[roomID] = session;

        const canSplit = CardsHandler.canSplit({ store: gameStore, roomID, playerID });

        expect(canSplit).toBe(true);
    });

    it("should determine if the player can't split", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Diamonds, value: CardValue.EIGHT },
            { id: "3", suit: Suit.Hearts, value: CardValue.EIGHT }];
        gameStore.game[roomID] = session;

        const canSplit = CardsHandler.canSplit({ store: gameStore, roomID, playerID });

        expect(canSplit).toBe(false);
    });

    it("should determine if the player can't split", () => {
        mockHand.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Diamonds, value: CardValue.EIGHT }];
        gameStore.game[roomID] = session;

        const canSplit = CardsHandler.canSplit({ store: gameStore, roomID, playerID });

        expect(canSplit).toBe(false);
    });

    it("should determine if the player can place insurance", () => {
        mockDealer.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.ACE }];

        gameStore.game[roomID] = session;

        const canPlaceInsurance = CardsHandler.canPlaceInsurance({ store: gameStore, roomID, playerID });

        expect(canPlaceInsurance).toBe(true);
    });

    it("should determine if the player can't place insurance", () => {
        mockDealer.cards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.EIGHT }];

        gameStore.game[roomID] = session;

        const canPlaceInsurance = CardsHandler.canPlaceInsurance({ store: gameStore, roomID, playerID });

        expect(canPlaceInsurance).toBe(false);
    });

    it("should calculate player's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.EIGHT }];

        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getPlayerPoints(mockCards);

        expect(actualPoints).toStrictEqual([8]);
    });

    it("should calculate player's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.EIGHT },
            { id: "2", suit: Suit.Diamonds, value: CardValue.TWO },
            { id: "3", suit: Suit.Diamonds, value: CardValue.FIVE }];

        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getPlayerPoints(mockCards);

        expect(actualPoints).toStrictEqual([15]);
    });

    it("should calculate player's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.J },
            { id: "2", suit: Suit.Diamonds, value: CardValue.Q },
            { id: "3", suit: Suit.Diamonds, value: CardValue.K }];
        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getPlayerPoints(mockCards);

        expect(actualPoints).toStrictEqual([30]);
    });

    it("should calculate player's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.ACE },
            { id: "2", suit: Suit.Diamonds, value: CardValue.TWO }];
        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getPlayerPoints(mockCards);

        expect(actualPoints).toStrictEqual([3, 13]);
    });

    it("should calculate player's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.ACE },
            { id: "2", suit: Suit.Diamonds, value: CardValue.ACE }];
        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getPlayerPoints(mockCards);

        expect(actualPoints).toStrictEqual([2, 12]);
    });

    it("should calculate dealer's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.ACE },
            { id: "2", suit: Suit.Diamonds, value: CardValue.ACE }];
        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getDealerPoints(mockCards);

        expect(actualPoints).toStrictEqual(12);
    });

    it("should calculate dealer's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.TEN },
            { id: "2", suit: Suit.Diamonds, value: CardValue.ACE },
            { id: "3", suit: Suit.Diamonds, value: CardValue.EIGHT }];
        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getDealerPoints(mockCards);

        expect(actualPoints).toStrictEqual(19);
    });

    it("should calculate dealer's score", () => {
        const mockCards = [{ id: "1", suit: Suit.Diamonds, value: CardValue.ACE },
            { id: "2", suit: Suit.Diamonds, value: CardValue.ACE },
            { id: "3", suit: Suit.Diamonds, value: CardValue.TEN }];
        gameStore.game[roomID] = session;

        const actualPoints = CardsHandler.getDealerPoints(mockCards);

        expect(actualPoints).toStrictEqual(12);
    });
});
