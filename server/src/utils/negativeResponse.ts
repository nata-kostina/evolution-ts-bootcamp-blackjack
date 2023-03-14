import { SocketResponse } from "../types/socketTypes.js";

export const negativeResponse = <T>(text: string, payload: T): SocketResponse<T> => {
  return {
    ok: false,
    statusText: text,
    payload,
  };
};
