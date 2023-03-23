import { Decision, GameSession, PlayerInstance, Notification, GameMode } from "./types";

export interface ServerToClientEvents {
    startGame: (response: SocketResponse<GameSession>) => void;
    getPlayer: (response: SocketResponse<PlayerInstance>) => void;
    finishGame: (response: SocketResponse<PlayerInstance>) => void;
    placeBet: (response: SocketResponse<GameSession>) => void;
    makeDecision: (response: SocketResponse<GameSession>) => void;
    notificate: (response: SocketResponse<Notification>, ack: () => void) => void;
    updateSession: (response: SocketResponse<GameSession>) => void;
    finishRound: (response: SocketResponse<GameSession>) => void;
    waitOthers: (response: SocketResponse<GameSession>) => void;
    getDecision: (response: SocketResponse<string>, acknowledgement: (responses: {
        playerID: PlayerID; ack: Decision; }) => void) => void;

}

export interface ClientToServerEvents {
    startGame: (payload: { playerID: PlayerID; mode: GameMode; }) => void;
    getPlayer: (id: SpecificID) => void;
    finishGame: (id: SpecificID) => void;
    placeBet: ({ playerID, roomID, bet, mode }: SpecificID & { bet: number; mode: GameMode; }) => void;
    makeDecision: (decision: DecisionRequest) => void;
    insurance: (payload: SpecificID & { accept: boolean; }) => void;
}

export type SocketResponse<T> = {
    ok: boolean;
    statusText: string;
    payload: T;
};

export type SpecificID = {
    readonly roomID: RoomID;
    readonly playerID: PlayerID;
};

export type DecisionRequest = {
    decision: Decision;
    id: SpecificID;
};

export type RoomID = string;
export type PlayerID = string;
