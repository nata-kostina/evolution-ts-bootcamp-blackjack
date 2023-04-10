import { UnholeCardPayload } from "./canvas.types";
import { Notification, YesNoAcknowledgement } from "./notification.types";
import { Action, Bet, GameMode, GameSession, NewCard, PlayerID, RoomID } from "./game.types";

export interface ServerToClientEvents {
    startGame: (response: SocketResponse<GameSession>) => void;
    placeBet: (response: SocketResponse<GameSession>) => void;
    updateSession: (response: SocketResponse<GameSession>) => void;
    dealCard: (response: SocketResponse<NewCard>) => void;
    notificate: (response: SocketResponse<Notification>) => void;
    unholeCard: (response: SocketResponse<UnholeCardPayload>) => void;
    finishRound: (response: SocketResponse<GameSession>) => void;
}

export interface ClientToServerEvents {
    startGame: ({ playerID, mode }: { playerID: PlayerID; mode: GameMode; }) => void;
    finishGame: ({ roomID, playerID }: SpecificID) => void;
    takeMoneyDecision: ({ roomID, playerID }: SpecificID & { response: YesNoAcknowledgement; }) => void;
    placeBet: ({ roomID, playerID, bet }: SpecificID & { bet: Bet; }) => void;
    makeDecision: ({ roomID, playerID, action }: SpecificID & { action: Action; }) => void;
    startPlay: ({ roomID, playerID }: SpecificID) => void;
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

export type RequestParameters<Event extends keyof ClientToServerEvents> = {
    event: Event;
    payload: Parameters<ClientToServerEvents[Event]>;
};

export enum SocketStatus {
    Disconnected = "disconnected",
    Connected = "connected",
    Waiting = "waiting",
    WithError = "error",
}
