import { Server } from "socket.io";
import { RoomID, Deck, PlayerInstance, DealerInstance, PlayerID, GameSession, Hand, Seat } from "./game.types.js";
import { ClientToServerEvents, ServerToClientEvents, SpecificID } from "./socket.types.js";

export interface GameState {
    roomID: RoomID;
    deck: Deck;
    players: Record<PlayerID, PlayerInstance>;
    dealer: DealerInstance;
}

export type State = Record<RoomID, GameState>;

export type UpdateGameParams = {
    roomID: RoomID;
    payload: { [key in keyof Partial<Omit<GameState, "playerID" | "roomID">>]: GameState[key] };
};
export type UpdatePlayerParams = {
    playerID: PlayerID;
    roomID: RoomID;
    payload: { [key in keyof Partial<Omit<PlayerInstance, "playerID" | "roomID">>]: PlayerInstance[key] };
};

export type UpdateHandParams = {
    playerID: PlayerID;
    roomID: RoomID;
    handID: string;
    payload: { [key in keyof Partial<Hand>]: Hand[key] };
};

export type UpdateDealerParams = {
    roomID: RoomID;
    payload: { [key in keyof Partial<DealerInstance>]: DealerInstance[key] };
};

export interface IStore {
    updateDeck({ roomID, deck }: { roomID: RoomID; deck: Deck; }): void;
    joinPlayerToGameState({ player, roomID }: { roomID: RoomID; player: PlayerInstance; }): void;
    getGame(roomID: RoomID): GameState;
    getPlayer({ roomID, playerID }: SpecificID): PlayerInstance;
    removeRoomFromStore(roomID: RoomID): void;
    removePlayerFromGame({ roomID, playerID }: SpecificID): void;
    getSession(roomID: RoomID): GameSession;
    getDeck(roomID: RoomID): Deck;
    updatePlayer({ playerID, roomID, payload }: UpdatePlayerParams): void;
    getDealer(roomID: RoomID): DealerInstance;
    updateDealer({ roomID, payload }: UpdateDealerParams): void;
    getActiveHand({ roomID, playerID }: SpecificID): Hand;
    updateHand({ playerID, roomID, handID, payload }: UpdateHandParams): void;
    getScore({ roomID, playerID, handID }: SpecificID & { handID: string; }): Array<number>;
    unholeCard(roomID: RoomID): void;
    resetPlayer({ playerID, roomID }: SpecificID): void;
    resetDealer(roomID: RoomID): void;
    resetSession({ playerID, roomID }: SpecificID): void;
    createNewRoom(): RoomID;
    reassignActiveHand({ roomID, playerID }: SpecificID): void;
    removeHand({ roomID, playerID, handID }: SpecificID & { handID: string; }): void;
    getHand({ roomID, playerID, handID }: SpecificID & { handID: string; }): Hand;
    getAvailableRoomID(io: Server<ClientToServerEvents, ServerToClientEvents>): RoomID | null;
}

export interface IPlayersStore {
    isNewPlayer(playerID: PlayerID): boolean;
    updatePlayerBalance({ playerID, balance }: { playerID: PlayerID; balance: number; }): void;
    removePlayer(playerID: PlayerID): void;
    getPlayerBalance(playerID: PlayerID): number;
}
