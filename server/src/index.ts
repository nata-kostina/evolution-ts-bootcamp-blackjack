import { Server } from 'socket.io';
import { isError } from './utils/isError.js';
import { Store } from './store/Store.class.js';
import { SocketInstance } from './instances/Socket.class.js';
import { makeDelayedSequence } from './utils/respondConfig.js';
import { PlaceBetNotification } from './constants/notifications.js';
import { betSchema, playerSchema, roomSchema } from './utils/validation.js';
import { ClientToServerEvents, ServerToClientEvents } from './types/socketTypes.js';

export const store = new Store();

const io = new Server<ClientToServerEvents, ServerToClientEvents>(3000, {
  cors: {
    origin: 'http://localhost:3001',
  },
});

io.engine.on('headers', (headers) => {
  headers['Access-Control-Allow-Credentials'] = true;
});

io.on('connection', (socket) => {
  console.log(`Socket ${socket.id} was connected`);

  const connection = new SocketInstance(socket);

  socket.on('startGame', (room) => {
    try {
      const { error } = roomSchema.validate(room);
      if (error) {
        throw new Error('Invalid parameter');
      }
      makeDelayedSequence(connection, () => {
        connection.handleStartGame([room]);
        connection.notificate(PlaceBetNotification);
      });
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
      makeDelayedSequence(connection, () => {
        connection.handlePlaceBet({ playerID, roomID, bet });
        connection.dealCards({ playerID, roomID });
        connection.checkCombination({ playerID, roomID });
      });
      console.log(`Socket ${socket.id} placed bet`);
    } catch (e) {
      console.log(`Socket ${socket.id} failed to place a bet`);
      socket.emit('placeBet', { ok: false, statusText: isError(e) ? e.message : 'Failed to place a bet' });
    }
  });

  socket.on('makeDecision', ({ decision, id }) => {
    try {
      const { error: roomIDError } = roomSchema.validate(id.roomID);
      const { error: playerIDError } = playerSchema.validate(id.playerID);

      if (roomIDError || playerIDError) {
        throw new Error('Invalid parameter');
      }
    } catch (error) {
      console.log(`Socket ${socket.id} failed to handle player's decision`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} was disconnected`);
  });
});
