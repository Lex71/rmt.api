import express from "express";

import { checkAuthenticated, isAdmin } from "../../middlewares/auth";
import validate from "../../middlewares/yup.validator";
import {
  create,
  // edit,
  // edit,
  getAll,
  getById,
  patch,
  // newFacility,
  remove,
  update,
} from "./facilities.controller";
// import validate from "../middlewares/validator";

const router = express.Router();

// Define routes

// All Facilities Route
router.get("/", /* checkAuthenticated, */ getAll);

// // New Facility Route
// router.get("/new", isAdmin, newFacility);

// Show Facility Route
router.get("/:id", checkAuthenticated, getById);

// // Edit Facility Route
// router.get("/:id/edit", isAdmin, edit);

// Create Facility Route
router.post("/", [isAdmin, validate("facilities", "post")], create);

// Update Facility Route
router.put("/:id", [isAdmin, validate("facilities/:id", "put")], update);

// Patch Facility Route
router.patch("/:id", [isAdmin, validate("facilities/:id", "patch")], patch);

// Delete Facility Route
router.delete("/:id", isAdmin, remove);

export default router;
