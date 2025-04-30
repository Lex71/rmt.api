// Centralized error handling middleware
import { NextFunction, Request, Response } from "express";

import { ApplicationError } from "../utils/errors.ts";

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
  res.status(err.statusCode || 500).json({ message: err.message });
}
