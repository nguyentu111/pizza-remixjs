export enum ERROR_NAME {
  DEFAULT = "SERVER_ERROR",
  MISSING_PERMISSIONS = "MISSING_PERMISSIONS",
  BAD_REQUEST = "BAD_REQUEST",
  NOT_ALLOWED = "NOT_ALLOWED",
  NOT_FOUND = "NOT_FOUND",
}

export class CustomHttpError extends Error {
  public statusCode: number = 500;
  public name: ERROR_NAME;
  constructor({
    message,
    statusCode,
    name = ERROR_NAME.DEFAULT,
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
