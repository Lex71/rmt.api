import express, { Request, Response } from "express";
import { getIndexData } from "../controllers/indexController.ts";

const router = express.Router();

import passport from "passport";
import { checkAuthenticated, isAdmin } from "../middlewares/auth.ts";
import User from "../models/user.ts";

router.get("/", checkAuthenticated, getIndexData);

router.get(
  "/me",
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate("jwt", { session: false }),
  isAdmin,
  (req: Request, res: Response) => {
    // console.log(`protected user: ${JSON.stringify(req.user)}`);
    // console.log(
    //   `protected user.password: ${req.user?.password ?? "NO PASSWORD"}`,
    // );
    // console.log("new User", new User(req.user).toJSON());
    res.status(200).json(new User(req.user).toJSON());
  },
);

export default router;
