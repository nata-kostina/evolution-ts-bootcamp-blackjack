import { Socket } from 'socket.io';
import { Action, Bet, PlayerID, SpecificID, YesNoAcknowledgement } from './index.js';

export interface Controller {
  handleInitGame({ playerID, socket }: { playerID: PlayerID | null; socket: Socket }): Promise<void>;
  handleDecision({ roomID, playerID, action }: SpecificID & { action: Action }): Promise<void>;
  finishGame({ playerID, roomID }: SpecificID): Promise<void>;
  handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: Bet }): Promise<void>;
  handleTakeMoneyDecision({
    playerID,
    roomID,
    response,
  }: SpecificID & { response: YesNoAcknowledgement }): Promise<void>;
  startPlay({ roomID, playerID }: SpecificID): Promise<void>;
}
