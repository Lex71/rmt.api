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
  // console.error(err.stack);
  console.log("sono l'errorHandler");
  // res
  //   .status(err.statusCode || 500)
  //   .json({ error: `from errorHandler: ${err.message}` }); // Use custom status code
  // oppure disegna una pagina di errore...
  // req.flash("error", err.message);
  // res.render("500", { layout: "layouts/error" });
  res.status(err.statusCode || 500).json({ error: err.message });
}
