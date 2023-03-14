import { Socket } from 'socket.io';
import { SocketInstance } from '../instances/Socket.class.js';
import { ServerToClientEvents, EventResponseMap } from '../types/socketTypes.js';

export type RespondFn = <T extends keyof Partial<ServerToClientEvents>>({
  event,
  payload,
}: EventResponseMap<T>) => void;

export const respondWithoutDelay = () => {
  const respond: RespondFn = ({ event, payload, socket }) => socket.emit(event, ...payload);
  return respond;
};

export const sendInSequence = (socket: Socket, initialDelay = 0) => {
  const delayStep = 1000;
  let delay = initialDelay;
  let abortSequence = false;
  return <T extends keyof Partial<ServerToClientEvents>>({ event, payload }: EventResponseMap<T>) => {
    setTimeout(() => {
      try {
        if (!abortSequence) {
          socket.emit(event, ...payload, ({ ok }: { ok: boolean }) => {
            if (!ok) {
              abortSequence = true;
            }
          });
        }
      } catch (error) {
        abortSequence = true;
      }
    }, delay);
    delay += delayStep;
  };
};

export const makeDelayedSequence = (socket: SocketInstance, callback: () => void) => {
  socket.setRespond(sendInSequence(socket.connection));
  callback();
  socket.setRespond(respondWithoutDelay());
};
