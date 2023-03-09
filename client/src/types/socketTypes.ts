import { Deck } from "./types";

export type SocketResponse<T> = {
    ok: boolean;
    statusText: string;
    payload?: T;
};

export interface ServerToClientEvents {
    startGame: (response: SocketResponse<Deck>) => void;
}

export interface ClientToServerEvents {
    startGame: (room: string) => void;
}
