import { PlayersStore } from "../store/players.store";

describe("Players' store", () => {
    let playersStore: PlayersStore;

    beforeEach(() => {
        playersStore = new PlayersStore();
    });

    it("should add player's balance", () => {
        const playerID = "123";
        playersStore.updatePlayerBalance({ playerID, balance: 456 });
        const playerState = playersStore.store[playerID];

        expect(playerState).not.toBeUndefined();
    });

    it("should get player's balance", () => {
        const playerID = "123";
        const balance = 456;
        playersStore.updatePlayerBalance({ playerID, balance });
        const currentBalance = playersStore.getPlayerBalance(playerID);

        expect(currentBalance).toEqual(balance);
    });

    it("should determine a new player", () => {
        const playerID = "123";
        const isNewPlayer = playersStore.isNewPlayer(playerID);

        expect(isNewPlayer).toEqual(true);
    });

    it("should determine the existing player", () => {
        const playerID = "123";
        const balance = 456;
        playersStore.updatePlayerBalance({ playerID, balance });
        const isNewPlayer = playersStore.isNewPlayer(playerID);

        expect(isNewPlayer).toEqual(false);
    });

    it("should remove the existing player", () => {
        const playerID = "123";
        const balance = 456;
        playersStore.updatePlayerBalance({ playerID, balance });
        playersStore.removePlayer(playerID);

        expect(playersStore.store[playerID]).toBeUndefined();
    });
});
