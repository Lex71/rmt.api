import express from "express";

import { checkAuthenticated } from "../../middlewares/auth";
import validate from "../../middlewares/yup.validator";
import {
  create,
  getAll,
  getById,
  patch,
  remove,
  update,
} from "./tables.controller";
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
router.post("/", [checkAuthenticated, validate("tables", "post")], create);

// Update Table Route
router.put(
  "/:id",
  [checkAuthenticated, validate("tables/:id", "put")],
  checkAuthenticated,
  update,
);

// Patch Table Route
router.patch(
  "/:id",
  [checkAuthenticated, validate("tables/:id", "patch")],
  patch,
);

// Delete Table Route
router.delete("/:id", checkAuthenticated, remove);

export default router;
