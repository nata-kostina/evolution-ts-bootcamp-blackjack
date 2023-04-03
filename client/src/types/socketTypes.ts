import {
    Decision,
    GameSession,
    Notification,
    GameMode,
    Acknowledgment,
    YesNoAcknowledgement,
    Bet,
    NewCard,
} from "./types";

export interface ServerToClientEvents {
    startGame: (response: SocketResponse<GameSession>) => void;
    placeBet: (
        response: SocketResponse<GameSession>,
        acknowledgement: (responses: Acknowledgment<Bet>) => void
    ) => void;
    dealCard: (response: SocketResponse<NewCard>) => void;
    notificate: (
        response: SocketResponse<Notification>,
        acknowledgement?: (response: Acknowledgment<YesNoAcknowledgement>) => void
    ) => void;
    updateSession: (response: SocketResponse<GameSession>) => void;
    finishRound: (response: SocketResponse<GameSession>) => void;
    getDecision: (
        response: SocketResponse<GameSession>,
        acknowledgement: (responses: Acknowledgment<Decision>) => void
    ) => void;
}

export interface ClientToServerEvents {
    startGame: (payload: { playerID: PlayerID; mode: GameMode; }) => void;
    finishGame: ({ roomID, playerID }: SpecificID) => void;
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
