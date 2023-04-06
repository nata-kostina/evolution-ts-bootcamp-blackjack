import {
    GameSession,
    Notification,
    GameMode,
    Acknowledgment,
    YesNoAcknowledgement,
    Bet,
    NewCard,
    Action,
} from "./types";

export interface ServerToClientEvents {
    startGame: (response: SocketResponse<GameSession>) => void;
    placeBet: (response: SocketResponse<GameSession>) => void;
    dealCard: (response: SocketResponse<NewCard>) => void;
    notificate: (
        response: SocketResponse<Notification>,
        acknowledgement?: (response: Acknowledgment<YesNoAcknowledgement>) => void
    ) => void;
    updateSession: (response: SocketResponse<GameSession>) => void;
    finishRound: (response: SocketResponse<GameSession>) => void;
    getDecision: (
        response: SocketResponse<GameSession>,
        acknowledgement: (responses: Acknowledgment<Action>) => void
    ) => void;
}

export interface ClientToServerEvents {
    startGame: ({ playerID, mode }: { playerID: PlayerID; mode: GameMode; }) => void;
    finishGame: ({ roomID, playerID }: SpecificID) => void;
    dealCards: ({ roomID, playerID }: SpecificID) => void;
    placeBet: ({ roomID, playerID, bet }: SpecificID & { bet: Bet; }) => void;
    makeDecision: ({ roomID, playerID, action }: SpecificID & { action: Action; }) => void;
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
    decision: Action;
    id: SpecificID;
};

export type RoomID = string;
export type PlayerID = string;

export type RequestParameters<Event extends keyof ClientToServerEvents> = {
    event: Event;
    payload: Parameters<ClientToServerEvents[Event]>;
};

export {};
