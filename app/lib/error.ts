export enum ERROR_NAME {
  default = "SERVER_ERROR",
  missing_permissions = "MISSING_PERMISSIONS",
  bad_requrest = "BAD_REQUEST",
  not_allowed = "NOT_ALLOWED",
  not_found = "NOT_FOUND",
}

export class CustomHttpError extends Error {
  public statusCode: number = 500;
  public name: ERROR_NAME;
  constructor({
    message,
    statusCode,
    name = ERROR_NAME.default,
  }: {
    name: ERROR_NAME;
    message: string;
    statusCode: number;
  }) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
  }
}
