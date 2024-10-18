import { TypedResponse } from "@remix-run/node";

export type RawActionResult<T extends object = object> = {
  success: boolean;
  errors?: string;
  fieldErrors?: T;
};
export type ActionResultType<T extends object = object> = TypedResponse<
  RawActionResult<T>
>;
