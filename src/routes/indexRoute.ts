import express, { NextFunction, Request, Response } from "express";
import { getIndexData } from "../controllers/indexController.ts";

const router = express.Router();

import {
  checkAuthenticated,
  checkNotAuthenticated,
} from "../middlewares/auth.ts";
import { fetchIndexData } from "../services/indexService.ts";

router.get("/free", checkNotAuthenticated, (_req: Request, res: Response) => {
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
  checkNotAuthenticated,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await fetchIndexData(undefined, false);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/index", checkAuthenticated, getIndexData);

export default router;
