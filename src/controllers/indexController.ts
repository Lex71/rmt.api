import { Request, Response } from "express";

import User from "../models/user";
import { fetchIndexData } from "../services/indexService";

export const getIndexData = async (req: Request, res: Response) => {
  try {
    const isAdmin = req.isAuthenticated() && req.user.role === "admin";
    const indexData = await fetchIndexData(isAdmin);
    // res.status(200).json(indexData);
    res.render("index", {
      data: indexData,
      user: new User(req.user).toJSON(),
      // user: new User(req.user).toJSON()
    });
  } catch {
    // throw new Error("Error fetching index data");
    req.flash("error", "Cannot fetch indexData");
    // res.locals.messages = "uffa";
    // res.locals.name = "Jane Doe";

    res.render("index", {
      data: [],
      user: new User(req.user).toJSON(),
    });
  }
};
