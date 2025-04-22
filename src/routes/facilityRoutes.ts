import express from "express";

import {
  create,
  // edit,
  // edit,
  getAll,
  getById,
  // newFacility,
  remove,
  update,
} from "../controllers/facilityController.ts";
import { checkAuthenticated, isAdmin } from "../middlewares/auth.ts";
import validate from "../middlewares/validator.ts";
// import ssrErrorHandler from "../middlewares/ssrErrorHandler";
// import validate from "../middlewares/validator.ts";

const router = express.Router();

// Define routes

// All Facilities Route
router.get("/", checkAuthenticated, getAll);

// // New Facility Route
// router.get("/new", isAdmin, newFacility);

// Show Facility Route
router.get("/:id", checkAuthenticated, getById);

// // Edit Facility Route
// router.get("/:id/edit", isAdmin, edit);

// Create Facility Route
router.post("/", isAdmin, validate("facilities", "post"), create);

// Update Facility Route
router.put("/:id", isAdmin, validate("facilities/:id", "put"), update);

// Delete Facility Route
router.delete("/:id", isAdmin, remove);

export default router;
