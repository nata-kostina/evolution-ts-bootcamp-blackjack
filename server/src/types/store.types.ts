import { RoomID, Deck, PlayerInstance, DealerInstance, PlayerID, GameSession } from './game.types.js';
import { SpecificID } from './socket.types.js';

export interface GameState {
  roomID: RoomID;
  hasStarted: boolean;
  organizer: PlayerID;
  deck: Deck;
  players: Record<PlayerID, PlayerInstance>;
  dealer: DealerInstance;
  dealNum: number;
}

export type State = Record<RoomID, GameState>;

export type UpdatePlayerParams = {
  playerID: PlayerID;
  roomID: RoomID;
  payload: { [key in keyof Partial<Omit<PlayerInstance, 'playerID' | 'roomID'>>]: PlayerInstance[key] };
};

export type UpdateDealerParams = {
  roomID: RoomID;
  payload: { [key in keyof Partial<DealerInstance>]: DealerInstance[key] };
};

export interface IStore {
  updateDeck({ roomID, deck }: { roomID: RoomID; deck: Deck }): void;
  joinPlayerToGameState({ player, roomID }: { roomID: RoomID; player: PlayerInstance }): void;
  getGame(roomID: RoomID): GameState;
  getPlayer({ roomID, playerID }: SpecificID): PlayerInstance;
  removeRoomFromStore(roomID: RoomID): void;
  removePlayerFromGame({ roomID, playerID }: SpecificID): void;
  getSession(roomID: RoomID): GameSession;
  getDeck(roomID: RoomID): Deck;
  updatePlayer({ playerID, roomID, payload }: UpdatePlayerParams): void;
  getDealer(roomID: RoomID): DealerInstance;
  updateDealer({ roomID, payload }: UpdateDealerParams): void;

  unholeCard(roomID: RoomID): void;
  resetPlayer({ playerID, roomID }: SpecificID): void;
  resetDealer(roomID: RoomID): void;
  resetSession({ playerID, roomID }: SpecificID): void;
  getResetSession({ playerID, roomID }: SpecificID): GameSession;
  createNewRoom(playerID: PlayerID): RoomID;
}

export interface IPlayersStore {
  isNewPlayer(playerID: PlayerID): boolean;
  updatePlayerBalance({ playerID, balance }: { playerID: PlayerID; balance: number }): void;
  removePlayer(playerID: PlayerID): void;
  getPlayerBalance(playerID: PlayerID): number;
}
