export interface IPlayer {
    id: string;
    balance: number;
    bet: number;
}

export type SocketResponse<T> = {
    ok: boolean;
    statusText: string;
    payload?: T;
};

export type PlaceBetParams = { roomID: string; playerID: string; bet: string; };
export type Card = [value: string, suit: string];
export type Deck = Card[];

export type ModalVariant = "gameError";

export interface ModalProps {
    type: ModalVariant;
    modalIsOpen: boolean;
    afterOpenModal: () => void;
    closeModal: () => void;
}

export type BetItem = { id: string; value: number; };
