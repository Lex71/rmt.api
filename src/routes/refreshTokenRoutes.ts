import express from "express";

import {
  refreshToken,
  revokeRefreshToken,
} from "../controllers/refreshTokenController";
import { isAdmin } from "../middlewares/auth";

const router = express.Router();

router.get("/refresh", refreshToken);
router.post("/revoke", isAdmin, revokeRefreshToken);

export default router;
