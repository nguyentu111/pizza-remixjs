export enum ERROR_NAME {
  DEFAULT = "SERVER_ERROR",
  MISSING_PERMISSIONS = "MISSING_PERMISSIONS",
  BAD_REQUEST = "BAD_REQUEST",
  NOT_ALLOWED = "NOT_ALLOWED",
  NOT_FOUND = "NOT_FOUND",
  INSUFFICIENT_MATERIALS = "INSUFFICIENT_MATERIALS",
}

export class CustomHttpError extends Error {
  public statusCode: number = 500;
  public name: ERROR_NAME;
  public data: any;
  constructor({
    message,
    statusCode,
    name = ERROR_NAME.DEFAULT,
    data,
  }: {
    name: ERROR_NAME;
    message: string;
    statusCode: number;
    data?: any;
  }) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.data = data;
  }
}
