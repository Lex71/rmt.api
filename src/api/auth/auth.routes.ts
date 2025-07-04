import express from "express";

import {
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
  // registerUser,
  whoami,
} from "./auth.controller";

// import { refreshToken } from "../controllers/refreshToken";

import { checkAuthenticated } from "../../middlewares/auth";
import validate from "../../middlewares/yup.validator";
// import validate from "../middlewares/zod.validator";

const router = express.Router();

// register submit
router.post("/register", [validate("auth/register", "post")], registerUser);

// login submit
router.post("/login", loginUser);
// router.post(
//   "/login",
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

router.post(
  "/change-password",
  [checkAuthenticated, validate("auth/change-password", "post")],
  changePassword,
);

export default router;
