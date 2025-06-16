import express from "express";
const router = express.Router();

import {
  sendPasswordResetEmail,
  setNewPassword,
  validatePasswordResetToken,
} from "../controllers/passwordController";

router.post("/", sendPasswordResetEmail);

router.get("/:userId/:token", validatePasswordResetToken);

router.post("/:userId/:token", setNewPassword);

export default router;
