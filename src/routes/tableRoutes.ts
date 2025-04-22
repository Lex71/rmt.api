import express from "express";

import {
  createTable,
  // editTable,
  getTable,
  getTables,
  // newTable,
  removeTable,
  updateTable,
} from "../controllers/tableController.ts";
import { checkAuthenticated } from "../middlewares/auth.ts";
// const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];

const router = express.Router();

// Define routes

// All Tables Route
router.get("/", checkAuthenticated, getTables);

// // New Table Route
// router.get("/new", checkAuthenticated, newTable);

// Show Table Route
router.get("/:id", checkAuthenticated, getTable);

// // Edit Table Route
// router.get("/:id/edit", checkAuthenticated, editTable);

// Create Table Route
router.post("/", checkAuthenticated, createTable);

// Update Table Route
router.put("/:id", checkAuthenticated, updateTable);

// Delete Table Route
router.delete("/:id", checkAuthenticated, removeTable);

export default router;
