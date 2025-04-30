import express from "express";

import {
  refreshToken,
  revokeRefreshToken,
} from "../controllers/refreshTokenController.ts";
import { isAdmin } from "../middlewares/auth.ts";

const router = express.Router();

router.get("/refresh", refreshToken);
router.post("/revoke", isAdmin, revokeRefreshToken);

export default router;
