import { v4 } from "uuid";
import { initialDeck } from "../constants/index.js";
import { GameState, Hand, PlayerInstance, SpecificID, Action, RoomID, Seat } from "../types/index.js";

export function initializeGameState(roomID: RoomID): GameState {
    return {
        roomID,
        deck: initialDeck,
        players: {},
        dealer: { cards: [], hasHoleCard: false, points: 0 },
    };
}

export function initializePlayer({
    playerID,
    roomID,
    balance = 2000,
}: SpecificID & { balance?: number; }): PlayerInstance {
    const activeHand = initializeHand(playerID);
    return {
        playerID,
        roomID,
        balance,
        bet: 0,
        insurance: 0,
        hands: [activeHand],
        activeHandID: activeHand.handID,
        availableActions: [Action.Bet],
        seat: Seat.Middle,
    };
}

export function initializeHand(parentID: string): Hand {
    return {
        bet: 0,
        cards: [],
        handID: v4(),
        parentID,
        points: [0],
        isStanding: false,
    };
}
