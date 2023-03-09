export interface ServerToClientEvents {
  startGame: (response: SocketResponse<Deck>) => void;
}

export interface ClientToServerEvents {
  startGame: (room: string) => void;
}

export type SocketResponse<T> = {
  ok: boolean;
  statusText: string;
  payload?: T;
};

export interface Player {
  id: string;
  balance: number;
  bet: number;
}

export interface GameSession {
  roomID: string;
  deck: Deck;
  players: Player[];
}

export type RoomID = string;

export type Room = [string, Set<string>];

export type State = Record<RoomID, GameSession>;

export type GetPlayerParams = { roomID: string; playerID: string };
export type PlaceBetParams = { roomID: string; playerID: string; bet: string };

export type Card = [value: string, suit: string];
export type Deck = Card[];
