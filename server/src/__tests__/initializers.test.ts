import { initialDeck } from "../constants";
import { Action, DealerInstance, Seat } from "../types";
import { initializeGameState, initializeHand, initializePlayer } from "../utils/initializers";

describe("Initialization functions", () => {
    it("should initialize game state", () => {
        const roomID = "room-id";
        const actualGameState = initializeGameState(roomID);

        const expectedDealer: DealerInstance = {
            cards: [],
            hasHoleCard: false,
            points: 0,
        };

        expect(actualGameState.dealer).toStrictEqual(expectedDealer);
        expect(actualGameState.deck).toStrictEqual(initialDeck);
        expect(actualGameState.players).toStrictEqual({});
        expect(actualGameState.roomID).toBe(roomID);
    });

    it("should initialize a player", () => {
        const playerID = "player-id";
        const roomID = "room-id";
        const balance = 2000;
        const player = initializePlayer({ roomID, playerID, balance });

        expect(player.availableActions).toStrictEqual([Action.Bet]);
        expect(player.balance).toBe(balance);
        expect(player.bet).toBe(0);
        expect(player.insurance).toBe(0);
        expect(player.playerID).toBe(playerID);
        expect(player.roomID).toBe(roomID);
        expect(player.seat).toBe(Seat.Middle);
    });

    it("should initialize a hand", () => {
        const playerID = "player-id";
        const hand = initializeHand(playerID);

        expect(hand.bet).toBe(0);
        expect(hand.cards).toStrictEqual([]);
        expect(hand.isStanding).toBe(false);
        expect(hand.parentID).toBe(playerID);
        expect(hand.points).toStrictEqual([0]);
    });
});
