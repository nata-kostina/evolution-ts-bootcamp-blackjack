import { Decision, GameSession, PlayerInstance, Notification } from "./types";

export interface ServerToClientEvents {
    startGame: (response: SocketResponse<GameSession>) => void;
    getPlayer: (response: SocketResponse<PlayerInstance>) => void;
    finishGame: (response: SocketResponse<PlayerInstance>) => void;
    placeBet: (response: SocketResponse<GameSession>) => void;
    getCards: (response: SocketResponse<GameSession>) => void;
    checkCombination: (response: SocketResponse<GameSession>) => void;
    makeDecision: (response: SocketResponse<GameSession>) => void;
    notificate: (response: SocketResponse<Notification>) => void;
    updateSession: (response: SocketResponse<GameSession>, callback?: ({ ok }: { ok: boolean; }) => void) => void;
    sendCard: (response: SocketResponse<GameSession>) => void;
}

export interface ClientToServerEvents {
    startGame: (room: string) => void;
    getPlayer: (id: SpecificID) => void;
    finishGame: (id: SpecificID) => void;
    placeBet: ({ playerID, roomID, bet }: SpecificID & { bet: number; }) => void;
    getCards: (id: SpecificID) => void;
    checkCombination: (id: SpecificID) => void;
    makeDecision: (decision: DecisionRequest) => void;
    requestMoney: (id: SpecificID) => void;
    denyTakeMoney: (id: SpecificID) => void;
}

export type SocketResponse<T> = {
    ok: boolean;
    statusText: string;
    payload?: T;
};

export type SpecificID = {
    readonly roomID: string;
    readonly playerID: string;
};

export type DecisionRequest = {
    decision: Decision;
    id: SpecificID;
};
