import { Socket } from "socket.io";
import {
    Action,
    Bet,
    PlayerID,
    Seat,
    SpecificID,
    YesNoAcknowledgement,
} from "./index.js";

export interface Controller {
    handleInitGame(payload: { playerID: PlayerID | null; socket: Socket; debug: boolean; }): Promise<void>;
    handleDecision({ roomID, playerID, action }: SpecificID & { action: Action; }): Promise<void>;
    handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: Bet; socketID: string; }): Promise<void>;
    handleTakeMoneyDecision({
        playerID,
        roomID,
        response,
    }: SpecificID & { response: YesNoAcknowledgement; }): Promise<void>;
    startPlay({ roomID, playerID }: SpecificID): Promise<void>;
    handleChooseSeat: ({ roomID, playerID, seat }: SpecificID & { seat: Seat; }) => void;
}
