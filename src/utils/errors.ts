export class ApplicationError extends Error {
  statusCode = 500;
  constructor(statusCode: number, message = "an error occurred") {
    super(message);
    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, ApplicationError.prototype);
    this.message = message;
    this.statusCode = statusCode || this.statusCode;
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(404, message || "resource not found");
  }
}