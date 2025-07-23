import express from "express";
const router = express.Router();

import validate from "../../middlewares/yup.validator";
import {
  sendPasswordResetEmail,
  setNewPassword,
  validatePasswordResetToken,
} from "./passwords.controller";

router.post("/", [validate("forgot-password", "post")], sendPasswordResetEmail);

router.get("/:userId/:token", validatePasswordResetToken);

router.post(
  "/:userId/:token",
  [validate("forgot-password/:user/:token", "post")],
  setNewPassword,
);

export default router;
