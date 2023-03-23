import { io } from '../index.js';
import { ServerToClientEvents, ResponseParameters } from '../types/socketTypes.js';

export type RespondFn = <T extends keyof Partial<ServerToClientEvents>>({
  response,
  event,
  roomID,
}: ResponseParameters<T>) => void;

export const respondWithoutDelay = () => {
  const respond: RespondFn = ({ event, response, roomID }) => {
    io.timeout(20000)
      .to(roomID)
      .emit<typeof event>(event, ...response);
  };
  return respond;
};

export const sendInSequence = (delay = 1000) => {
  let abortSequence = false;
  const respond: RespondFn = async ({ event, response, roomID }) => {
    console.log(`Send in sequence, delay: `, delay);
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          if (!abortSequence) {
              io.timeout(20000)
                .to(roomID)
                .emit(event, ...response);
            console.log('emit ', event);
            return resolve();
          }
        } catch (error) {
          abortSequence = true;
        }
      }, delay);
    });
  };
  return respond;
};
