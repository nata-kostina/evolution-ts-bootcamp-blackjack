import { Server } from 'socket.io';
import { isError } from './utils/isError.js';
import { Store } from './store/Store.class.js';
import { playerSchema } from './utils/validation.js';
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

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} was disconnected`);
  });
});
