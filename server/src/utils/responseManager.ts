import { Server } from 'socket.io';
import { ClientToServerEvents, ResponseParameters, ServerToClientEvents } from '../types/index.js';

export type RespondFn = <T extends keyof Partial<ServerToClientEvents>>({
  response,
  event,
  roomID,
}: ResponseParameters<T>) => Promise<void>;

export interface IResponseManager {
  respond<T extends keyof Partial<ServerToClientEvents>>({ response, event, roomID }: ResponseParameters<T>): void;
  respondWithDelay<T extends keyof Partial<ServerToClientEvents>>({
    response,
    event,
    roomID,
  }: ResponseParameters<T>): Promise<void>;
}

export class ResponseManager implements IResponseManager {
  private readonly _server: Server<ClientToServerEvents, ServerToClientEvents>;
  
  public constructor(server: Server<ClientToServerEvents, ServerToClientEvents>) {
    this._server = server;
  }

  public respond<T extends keyof Partial<ServerToClientEvents>>({
    response,
    event,
    roomID,
  }: ResponseParameters<T>): void {
    try {
      this._server
        .timeout(20000)
        .to(roomID)
        .emit(event, ...response);
    } catch (error) {
      console.log(error);
    }
  }

  public async respondWithDelay<T extends keyof Partial<ServerToClientEvents>>({
    response,
    event,
    roomID,
    delay
  }: ResponseParameters<T>): Promise<void> {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          this._server
            .timeout(20000)
            .to(roomID)
            .emit(event, ...response);
          return resolve();
        } catch (error) {
          console.log('Error respond with delay');
        }
      }, delay ? delay : 800);
    });
  }
}
// export const sendImmediately = () => {
//   const respond: RespondFn = async ({ event, response, roomID }) => {
//     io.timeout(20000)
//       .to(roomID)
//       .emit(event, ...response);
//   };
//   return respond;
// };

// export const sendInSequence = (delay = 800) => {
//   let abortSequence = false;
//   const respond: RespondFn = async ({ event, response, roomID }) => {
//     // console.log(`Send in sequence, delay: `, delay);
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         try {
//           if (!abortSequence) {
//               io.timeout(20000)
//                 .to(roomID)
//                 .emit(event, ...response);
//             // console.log('emit ', event);
//             return resolve();
//           }
//         } catch (error) {
//           abortSequence = true;
//         }
//       }, delay);
//     });
//   };
//   return respond;
// };
