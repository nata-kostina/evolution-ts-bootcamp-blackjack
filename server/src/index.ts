import { Server } from 'socket.io';
import { ClientToServerEvents, GameSession, GetPlayerParams, Player, ServerToClientEvents, State } from './types.js';
import { createNewGameSession, isError } from './utils.js';
import { roomSchema } from './validation.js';

const state: State = {};
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

  socket.on('startGame', (room) => {
    try {
      const { error } = roomSchema.validate(room);

      if (error) {
        throw new Error('Invalid parameter');
      }

      const game = getGameSession(room);
      const player = createNewPlayer(socket.id);
      joinPlayerToGameSession(game, player);

      socket.emit('startGame', { ok: true, statusText: 'Ok', payload: game.deck });
    } catch (e: unknown) {
      console.log(`Socket ${socket.id} failed to start a game`);
      socket.emit('startGame', { ok: false, statusText: isError(e) ? e.message : 'Fail to start a game' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} was disconnected`);
  });
});

const maxPlayersNum = 4;
const getAvailableRoomID = (): [string, Set<string>] | null => {
  const rooms = io.sockets.adapter.rooms;
  for (const [id, participants] of rooms) {
    if (id.startsWith('Room_id_') && participants.size < maxPlayersNum) {
      return [id, participants];
    }
  }
  return null;
};

const generateNewRoom = (): [string, Set<string>] => {
  return ['Room_id_' + Math.random().toString(36).substring(2, 13), new Set()];
};

function getGameSession(roomID: string): GameSession {
  if (state[roomID]) {
    return state[roomID];
  } else {
    state[roomID] = createNewGameSession(roomID);
    return state[roomID];
  }
}

function createNewPlayer(id: string): Player {
  return { id, balance: 1000, bet: 0 };
}

function joinPlayerToGameSession(game: GameSession, player: Player): void {
  game.players.push(player);
}

function getPlayer({ roomID, playerID }: GetPlayerParams): Player {
  if (state[roomID]) {
    const player = state[roomID].players.find((player) => (player.id = playerID));
    if (player) {
      return player;
    } else {
      throw new Error('There is no such player');
    }
  }
  throw new Error('There is no such room');
}

type PlaceBetFn = ({ roomID, playerID, bet }: { roomID: string; playerID: string; bet: string }) => void;

const handlePlaceBet: PlaceBetFn = ({ roomID, playerID, bet }) => {
  const player = getPlayer({ roomID, playerID });
  if (player) {
    if (+bet < player.balance) {
      player.bet = +bet;
      player.balance -= +bet;
    } else {
      throw new Error("Bet is greater than player's balance");
    }
  }
};
