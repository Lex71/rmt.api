import express from "express";

import { getIndexData } from "../controllers/indexController.ts";

const router = express.Router();

import { checkAuthenticated } from "../middlewares/auth.ts";

router.get("/", checkAuthenticated, getIndexData);

export default router;
