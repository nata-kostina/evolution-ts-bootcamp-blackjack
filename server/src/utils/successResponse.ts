import { SuccessResponse } from "../types/index.js";

export const successResponse = <T>(payload: T): SuccessResponse<T> => {
  return {
    ok: true,
    statusText: 'Ok',
    payload,
  };
};
