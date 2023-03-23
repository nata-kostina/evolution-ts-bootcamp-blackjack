import { Server } from 'socket.io';
import { isError } from './utils/isError.js';
import { Store } from './store/Store.class.js';
import { betSchema, playerSchema } from './utils/validation.js';
import { ClientToServerEvents, GameMode, ServerToClientEvents } from './types/socketTypes.js';
import { SinglePlayerController } from './instances/SinglePlayerController.js';
import { MultiPlayersController } from './instances/MultiPlayersController.js';
import { Controller } from './types.js';
import { initializePlayer } from './utils/initializers.js';
import { PlayersStore } from './store/PlayersStore.class.js';

export const store = new Store();
export const playersStore = new PlayersStore();
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
  const multiPlayersController = new MultiPlayersController(socket);
  const controllerMap = {
    [GameMode.Single]: singlePlayerController,
    [GameMode.Multi]: multiPlayersController,
  };
  let controller = singlePlayerController;
  const changeController = (newController: Controller) => {
    controller = newController;
  };
  const player = initializePlayer({ playerID: socket.id, roomID: socket.id });
  socket.on('startGame', ({ playerID, mode }) => {
    try {
      const { error } = playerSchema.validate(playerID);
      if (error) {
        throw new Error('Invalid parameter');
      }
      changeController(controllerMap[mode]);
      controller.handleStartGame({ playerID, socket });
      console.log(`Socket ${socket.id} started a game`);
    } catch (e: unknown) {
      console.log(`Socket ${socket.id} failed to start a game`);
      socket.emit('startGame', { ok: false, statusText: isError(e) ? e.message : 'Failed to start a game' });
    }
  });

  socket.on('placeBet', ({ roomID, playerID, bet }) => {
    try {
      const player = store.getPlayer({ roomID, playerID });
      const { error } = betSchema.validate(bet, { context: { min: 0, max: player.balance } });
      if (error) {
        throw new Error('Invalid bet');
      }
      controller.handlePlaceBet({ playerID, roomID, bet });
      console.log(`Socket ${socket.id} request to place bet`);
    } catch (e) {
      console.log(`Socket ${socket.id} failed to place a bet`);
      socket.emit('placeBet', { ok: false, statusText: isError(e) ? e.message : 'Failed to place a bet' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} was disconnected`);
  });
});
