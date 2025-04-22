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
    const isAdmin = req.isAuthenticated() && req.user.role === "admin";
    const facility = req.user?.facility;
    const indexData = await fetchIndexData(facility, isAdmin);
    // res.status(200).json({ data: indexData });
    // res.render("index", {
    //   data: indexData,
    //   user: new User(req.user).toJSON(),
    //   // user: new User(req.user).toJSON()
    // });
    res.status(200).json({ data: indexData });
  } catch {
    next(new ApplicationError(500, "Cannot fetch indexData"));
    // throw new Error("Error fetching index data");
    // req.flash("error", "Cannot fetch indexData");
    // res.locals.messages = "uffa";
    // res.locals.name = "Jane Doe";
    // res.render("index", {
    //   data: [],
    //   user: new User(req.user).toJSON(),
    // });
  }
};
