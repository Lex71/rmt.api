import express from "express";
const router = express.Router();

import {
  receiveNewPassword,
  sendPasswordResetEmail,
} from "../controllers/emailController";

router.post("/user/:email", sendPasswordResetEmail);

router.post("/receive_new_password/:userId/:token", receiveNewPassword);

export default router;
