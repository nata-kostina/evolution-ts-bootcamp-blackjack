import { Server, Socket } from 'socket.io';
import { Action, Bet, ClientToServerEvents, PlayerID, ServerToClientEvents, SpecificID, YesNoAcknowledgement } from './index.js';

export interface Controller {
  handleInitGame({ playerID, socket, io }: { playerID: PlayerID | null; socket: Socket, io: Server<ClientToServerEvents, ServerToClientEvents>; }): Promise<void>;
  handleDecision({ roomID, playerID, action }: SpecificID & { action: Action }): Promise<void>;
  handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: Bet, socketID: string }): Promise<void>;
  handleTakeMoneyDecision({
    playerID,
    roomID,
    response,
  }: SpecificID & { response: YesNoAcknowledgement }): Promise<void>;
  startPlay({ roomID, playerID }: SpecificID): Promise<void>;
}
