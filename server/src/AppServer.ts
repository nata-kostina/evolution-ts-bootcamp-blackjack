import { isError } from 'joi';
import { Server } from 'socket.io';
import { SinglePlayerController } from './controllers/SinglePlayer.controller';
import { PlayerStore } from './store/Players.store.class';
import { ClientToServerEvents, ResponseParameters, ServerToClientEvents } from './types';
import { actionSchema, betSchema, playerSchema, roomSchema, yesNoResponseSchema } from './utils/validation';
import { GameStore } from './store/Game.store.class';
import { IRespondManager, RespondFn, RespondManager } from './utils/respondManager';

export class AppServer {
  private readonly _IO: Server<ClientToServerEvents, ServerToClientEvents>;
  private readonly _respondManager: IRespondManager;

  constructor(clientURL: string) {
    this._IO = new Server<ClientToServerEvents, ServerToClientEvents>(3000, {
      cors: {
        origin: clientURL,
      },
    });

    this._IO.engine.on('headers', (headers) => {
      headers['Access-Control-Allow-Credentials'] = true;
    });

    this._respondManager = new RespondManager(this._IO);
  }

  public listen(): void {
    this._IO.on('connection', (socket) => {
      console.log(`Socket ${socket.id} was connected`);
      const singlePlayerController = new SinglePlayerController();
      const controller = singlePlayerController;

      socket.on('startGame', async ({ playerID }) => {
        const roomID = GameStore.createNewRoom(socket.id);
        socket.join(roomID);

        try {
          const { error } = playerSchema.validate(playerID);
          if (error) {
            throw new Error('Invalid parameter');
          }
          await controller.handleStartGame({ roomID, playerID });
          console.log(`Socket ${socket.id} started a game`);
        } catch (e: unknown) {
          this._IO
            .to(roomID)
            .emit('startGame', { ok: false, statusText: isError(e) ? e.message : 'Failed to start a game' });
        }
      });

      socket.on('finishGame', ({ roomID, playerID }) => {
        try {
          const { error } = playerSchema.validate(playerID);
          if (error) {
            throw new Error('Invalid parameter');
          }
          controller.finishGame({ roomID, playerID });
          console.log(`Socket ${socket.id} finished a game`);
        } catch (e: unknown) {
          console.log(isError(e) ? e.message : `Socket ${socket.id} failed to finish a game`);
        }
      });

      socket.on('makeDecision', ({ roomID, playerID, action }) => {
        try {
          const { error: roomSchemaError } = roomSchema.validate(roomID);
          const { error: playerSchemaError } = playerSchema.validate(playerID);
          const { error: actionSchemaError } = actionSchema.validate(action);
          if (roomSchemaError || playerSchemaError || actionSchemaError) {
            throw new Error('Invalid parameter');
          }
          controller.handleDecision({ roomID, playerID, action });
          console.log(`Socket ${socket.id} finished a game`);
        } catch (e: unknown) {
          console.log(isError(e) ? e.message : `Socket ${socket.id} failed to send decisthis._IOn`);
        }
      });

      socket.on('placeBet', ({ roomID, playerID, bet }) => {
        try {
          const { error: roomSchemaError } = roomSchema.validate(roomID);
          const { error: playerSchemaError } = playerSchema.validate(playerID);
          const { error: betSchemaError } = betSchema.validate(bet, {
            context: { min: 0.1, max: PlayerStore.getPlayerBalance(playerID) },
          });
          if (roomSchemaError || playerSchemaError || betSchemaError) {
            throw new Error('Invalid parameter');
          }
          controller.handlePlaceBet({ roomID, playerID, bet });
          console.log(`Socket ${socket.id} placed bet`);
        } catch (e: unknown) {
          console.log(isError(e) ? e.message : `Socket ${socket.id} failed to place bet`);
        }
      });
      socket.on('takeMoneyDecision', ({ roomID, playerID, response }) => {
        try {
          const { error: roomSchemaError } = roomSchema.validate(playerID);
          const { error: playerSchemaError } = playerSchema.validate(playerID);
          const { error: responseSchemaError } = yesNoResponseSchema.validate(response);
          if (roomSchemaError || playerSchemaError || responseSchemaError) {
            throw new Error('Invalid parameter');
          }
          controller.handleTakeMoneyDecision({ roomID, playerID, response });
          console.log(`Socket ${socket.id} placed bet`);
        } catch (e: unknown) {
          console.log(isError(e) ? e.message : `Socket ${socket.id} failed to place bet`);
        }
      });

      socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} was disconnected`);
      });
    });
  }
}
