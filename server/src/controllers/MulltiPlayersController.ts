/* eslint-disable @typescript-eslint/no-empty-function */
import { Socket } from 'socket.io';
import { Action, Bet, Controller, IPlayersStore, IStore, PlayerID, SpecificID, YesNoAcknowledgement } from '../types';
import { IResponseManager } from '../utils/responseManager';

export class SinglePlayerController implements Controller {
  private readonly _playersStore: IPlayersStore;
  private readonly _gameStore: IStore;
  private readonly _respondManager: IResponseManager;

  constructor(playersStore: IPlayersStore, gameStore: IStore, respondManager: IResponseManager) {
    this._playersStore = playersStore;
    this._gameStore = gameStore;
    this._respondManager = respondManager;
  }
  public async handleInitGame({ playerID, socket }: { playerID: PlayerID | null; socket: Socket }): Promise<void> {}
  public async handleDecision({ roomID, playerID, action }: SpecificID & { action: Action }): Promise<void> {}
  public async handlePlaceBet({ playerID, roomID, bet }: SpecificID & { bet: Bet }): Promise<void> {}
  public async handleTakeMoneyDecision({
    playerID,
    roomID,
    response,
  }: SpecificID & { response: YesNoAcknowledgement }): Promise<void> {}
  public async startPlay({ roomID, playerID }: SpecificID): Promise<void> {}
}
