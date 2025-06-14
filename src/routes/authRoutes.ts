import express from "express";

import {
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
  // registerUser,
  whoami,
} from "../controllers/authController";

// import { refreshToken } from "../controllers/refreshToken";

import { checkAuthenticated, checkNotAuthenticated } from "../middlewares/auth";
import validate from "../middlewares/yup.validator";
// import validate from "../middlewares/zod.validator";

const router = express.Router();

// register submit
router.post(
  "/register",
  [checkNotAuthenticated, validate("auth/register", "post")],
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

router.post("/changePassword", checkAuthenticated, changePassword);

export default router;
