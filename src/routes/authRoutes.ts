import express from "express";

import {
  loginUser,
  logoutUser,
  registerUser,
  // registerUser,
  whoami,
} from "../controllers/authController.ts";

// import { refreshToken } from "../controllers/refreshToken.ts";

import {
  checkAuthenticated,
  checkNotAuthenticated,
} from "../middlewares/auth.ts";
import validate from "../middlewares/validator.ts";
// import validate from "../middlewares/validator.ts";

const router = express.Router();

// register submit
router.post(
  "/register",
  checkNotAuthenticated,
  validate("auth/register", "post"),
  registerUser,
);

// login submit
router.post("/login", checkNotAuthenticated, loginUser);
// router.post(
//   "/login",
//   checkNotAuthenticated,
//   passport.authenticate("local", {
//     successRedirect: "/",
//     failureRedirect: "/auth/login",
//     failureFlash: true,
//   }),
// );

router.delete("/logout", checkAuthenticated, logoutUser);

// router.post("/refresh", refreshToken);
// router.post("/revoke", isAdmin, refreshToken);

router.get("/whoami", checkAuthenticated, whoami);

export default router;
