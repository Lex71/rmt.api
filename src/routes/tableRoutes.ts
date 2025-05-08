import express from "express";

import {
  create,
  getAll,
  // edit,
  getById,
  // newTable,
  // newTable,
  remove,
  update,
} from "../controllers/tableController";
import { checkAuthenticated } from "../middlewares/auth";
// const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"];

const router = express.Router();

// Define routes

// All Tables Route
router.get("/", checkAuthenticated, getAll);

// // New Table Route
// router.get("/new", checkAuthenticated, newTable);

// Show Table Route
router.get("/:id", checkAuthenticated, getById);

// // Edit Table Route
// router.get("/:id/edit", checkAuthenticated, edit);

// Create Table Route
router.post("/", checkAuthenticated, create);

// Update Table Route
router.put("/:id", checkAuthenticated, update);

// Delete Table Route
router.delete("/:id", checkAuthenticated, remove);

export default router;
