import express, { NextFunction, Request, Response } from "express";
import { getIndexData } from "./home.controller";

const router = express.Router();

import { checkAuthenticated } from "../../middlewares/auth";
import { fetchIndexData } from "./home.service";

router.get("/free", (_req: Request, res: Response) => {
  res.status(200).json({
    data: [
      { address: "via Uno", name: "Facility 1" },
      { address: "via Due", name: "Facility 2" },
    ],
  });
});

// // test this route when no db is running, and you get message: "Cannot fetch index data"
router.get(
  "/free2",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await fetchIndexData(undefined, false);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/free3", (_req: Request, res: Response, next: NextFunction) => {
  try {
    // res.status(202).json({ message: "Email sent" });
    res.status(202).json({ data: { info: "Email sent" } });
  } catch (error) {
    next(error);
  }
});

router.get("/home", checkAuthenticated, getIndexData);

export default router;
