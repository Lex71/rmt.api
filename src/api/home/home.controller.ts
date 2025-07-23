import { NextFunction, Request, Response } from "express";

// import User from "../../models/user";
import { ApplicationError } from "../../utils/errors";
import { fetchIndexData } from "./home.service";

export const getIndexData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isAdmin = req.user?.role === "admin";
    const facility = req.user?.facility;
    // let facility = req.user?.facility;
    // if (!facility) {
    //   if (req.query.facility != null && req.query.facility !== "") {
    //     facility = new Types.ObjectId(req.query.facility as string);
    //   }
    // }
    if (!facility && !isAdmin) {
      next(new ApplicationError(403, "Facility missing"));
      return;
    }
    const indexData = await fetchIndexData(facility, isAdmin);
    res.status(200).json({ data: indexData });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Cannot get indexData"));
    }
  }
};
