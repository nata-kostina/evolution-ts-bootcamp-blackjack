import {
    GameSession,
    Notification,
    GameMode,
    Acknowledgment,
    Bet,
    NewCard,
    Action,
    YesNoAcknowledgement,
    UnholeCardPayload,
} from "./types";

export interface ServerToClientEvents {
    startGame: (response: SocketResponse<GameSession>) => void;
    placeBet: (response: SocketResponse<GameSession>) => void;
    dealCard: (response: SocketResponse<NewCard>) => void;
    notificate: (response: SocketResponse<Notification>) => void;
    updateSession: (response: SocketResponse<GameSession>) => void;
    finishRound: (response: SocketResponse<GameSession>) => void;
    getDecision: (
        response: SocketResponse<GameSession>,
        acknowledgement: (responses: Acknowledgment<Action>) => void
    ) => void;
    unholeCard: (response: SocketResponse<UnholeCardPayload>) => void;

}

export interface ClientToServerEvents {
    startGame: ({ playerID, mode }: { playerID: PlayerID; mode: GameMode; }) => void;
    finishGame: ({ roomID, playerID }: SpecificID) => void;
    takeMoneyDecision: ({ roomID, playerID }: SpecificID & { response: YesNoAcknowledgement; }) => void;
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
