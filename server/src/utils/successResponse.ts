import { SuccessResponse } from "../types";

export const successResponse = <T>(payload: T): SuccessResponse<T> => {
  return {
    ok: true,
    statusText: 'Ok',
    payload,
  };
};
