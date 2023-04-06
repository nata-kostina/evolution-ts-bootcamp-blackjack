import { Server } from 'socket.io';
import { isError } from './utils/isError.js';
import { Store } from './store/Store.class.js';
import { actionSchema, betSchema, playerSchema, roomSchema } from './utils/validation.js';
import { ClientToServerEvents, ServerToClientEvents } from './types/socketTypes.js';
import { SinglePlayerController } from './instances/SinglePlayerController.js';
import { PlayersStore } from './store/PlayersStore.class.js';
import { ConnectionStore } from './store/ConnectionStore.class.js';

export const store = new Store();
export const playersStore = new PlayersStore();
export const connectionStore = new ConnectionStore();
export const io = new Server<ClientToServerEvents, ServerToClientEvents>(3000, {
  cors: {
    origin: 'http://localhost:3001',
  },
});

io.engine.on('headers', (headers) => {
  headers['Access-Control-Allow-Credentials'] = true;
});

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} was connected`);

  const singlePlayerController = new SinglePlayerController(socket);
  const controller = singlePlayerController;

  socket.on('startGame', async ({ playerID }) => {
    const roomID = store.createNewRoom(socket.id);
    try {
      const { error } = playerSchema.validate(playerID);
      if (error) {
        throw new Error('Invalid parameter');
      }
      await controller.handleStartGame({ roomID, playerID });
      console.log(`Socket ${socket.id} started a game`);
    } catch (e: unknown) {
      io.to(roomID).emit('startGame', { ok: false, statusText: isError(e) ? e.message : 'Failed to start a game' });
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
      const { error: playerSchemaError } = playerSchema.validate(playerID);
      const { error: actionSchemaError } = actionSchema.validate(action);
      if (playerSchemaError || actionSchemaError) {
        throw new Error('Invalid parameter');
      }
      // controller.handleDecision({ roomID, playerID, action });
      console.log(`Socket ${socket.id} finished a game`);
    } catch (e: unknown) {
      console.log(isError(e) ? e.message : `Socket ${socket.id} failed to send decision`);
    }
  });
  socket.on('placeBet', ({ roomID, playerID, bet }) => {
    try {
      const { error: roomSchemaError } = roomSchema.validate(playerID);
      const { error: playerSchemaError } = playerSchema.validate(playerID);
      const { error: betSchemaError } = betSchema.validate(bet, {
        context: { min: 0.1, max: playersStore.getPlayerBalance(playerID) },
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

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} was disconnected`);
  });
});
