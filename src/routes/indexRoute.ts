import express from "express";

import { getIndexData } from "../controllers/indexController";

const router = express.Router();

import { checkAuthenticated } from "../middlewares/auth";

router.get("/", checkAuthenticated, getIndexData);

export default router;
