import { Store } from "../store/game.store";
import { CardValue, Deck, GameState, Suit } from "../types/index";
// import { initializePlayer } from "../utils/initializers.js";

describe("Players' store", () => {
    let gameStore: Store;
    const playerID = "123";
    const roomID = "456";
    const session: GameState = {
        deck: [],
        roomID,
        dealer: { cards: [], hasHoleCard: true, points: 10 },
        players: {
            [playerID]: {
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
            },
        },
        isMultiplayer: false,
    };

    beforeEach(() => {
        gameStore = new Store();
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

    // it("should join player to the game state", () => {
    //     const expectedPlayer = initializePlayer({ playerID, roomID, balance: 1000 });

    //     gameStore.joinPlayerToGameState({ player: expectedPlayer, roomID });

    //     const actualPlayer = gameStore.game[roomID].players[playerID];

    //     expect(actualPlayer).toStrictEqual(expectedPlayer);
    // });

    // it("should get a game by room id", () => {
    //     gameStore.game[roomID] = session;

    //     const actualGame = gameStore.getGame(roomID);

    //     expect(actualGame).toStrictEqual(session);
    // });
});

// "transform": {
//     "^.+\\.tsx?$": "ts-jest"
//   },
//   "modulePaths": ["<rootDir>"],
//   "moduleFileExtensions": ["json", "js", "ts"]
