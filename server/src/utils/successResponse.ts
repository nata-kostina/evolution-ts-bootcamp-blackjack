import { SocketResponse } from "../types/socketTypes.js";

export const successResponse = <T>(payload: T): SocketResponse<T> => {
  return {
    ok: true,
    statusText: 'Ok',
    payload,
  };
};
