// Centralized error handling middleware
import { NextFunction, Request, Response } from "express";

import { ApplicationError } from "../utils/errors";

export function errorHandler(
  err: ApplicationError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error(err.stack);
  res
    .status(err.statusCode || 500)
    .json({ error: `from errorHandler: ${err.message}` }); // Use custom status code
  // oppure disegna una pagina di errore...
  // res
  //   .render("error", {
  //     message: err.message,
  //     stack: err.stack,
  //   });
}
