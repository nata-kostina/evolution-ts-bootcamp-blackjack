import { SuccessResponse } from "../types/socketTypes.js";

export const successResponse = <T>(payload: T): SuccessResponse<T> => {
  return {
    ok: true,
    statusText: 'Ok',
    payload,
  };
};
