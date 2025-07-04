import express from "express";

import { isAdmin } from "../../middlewares/auth";
import { refreshToken, revokeRefreshToken } from "./refresh-token.controller";

const router = express.Router();

router.get("/refresh", refreshToken);
router.post("/revoke", isAdmin, revokeRefreshToken);

export default router;
