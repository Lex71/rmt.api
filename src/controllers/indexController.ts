import { NextFunction, Request, Response } from "express";

// import User from "../models/user.ts";
import { fetchIndexData } from "../services/indexService.ts";
import { ApplicationError } from "../utils/errors.ts";

export const getIndexData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const facility = req.user?.facility;
    const indexData = await fetchIndexData(facility, isAdmin);
    res.status(200).json({ data: indexData });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Cannot fetch indexData"));
    }
  }
};
