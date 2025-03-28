import { Request, Response } from "express";
import { fetchIndexData } from "../services/indexService";

export const getIndexData = async (req: Request, res: Response) => {
  try {
    const indexData = await fetchIndexData();
    // res.status(200).json(indexData);
    res.render("index", {
      user: req.user,
      data: { user: req.user, facilities: indexData },
    });
  } catch (error: any) {
    // throw new Error("Error fetching index data");
    console.log(error.message);
    // req.flash("error", "Cannot fetch data");
    // res.locals.messages = "uffa";
    // res.locals.name = "Jane Doe";
    res.render("index", {
      data: req.user,
      facilities: [],
      messages: error.message,
    });
  }
};
