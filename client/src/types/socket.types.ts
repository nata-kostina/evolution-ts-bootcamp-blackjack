import { UnholeCardPayload } from "./canvas.types";
import { Notification, YesNoAcknowledgement } from "./notification.types";
import { Action, Bet, DealPlayerCard, GameMode, GameSession, DealDealerCard, PlayerID, RoomID, GameResult } from "./game.types";

export interface ServerToClientEvents {
    initGame: (response: SocketResponse<{ game: GameSession; playerID: PlayerID; }>) => void;
    placeBet: (response: SocketResponse<GameSession>) => void;
    updateSession: (response: SocketResponse<GameSession>) => void;
    dealDealerCard: (response: SocketResponse<DealDealerCard>) => void;
    dealPlayerCard: (response: SocketResponse<DealPlayerCard>) => void;
    notificate: (response: SocketResponse<Notification>) => void;
    unholeCard: (response: SocketResponse<UnholeCardPayload>) => void;
    finishRound: (response: SocketResponse<GameSession>) => void;
    split: (response: SocketResponse<GameSession>) => void;
    finishRoundForHand: (response: SocketResponse<FinishRoundForHand>) => void;
}

export interface ClientToServerEvents {
    initGame: ({ playerID, mode }: { playerID: PlayerID | null; mode: GameMode; }) => void;
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

export type FinishRoundForHand = {
    roomID: RoomID;
    playerID: PlayerID;
    handID: string;
    result: GameResult;
};
