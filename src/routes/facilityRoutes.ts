import express from "express";

import {
  createFacility,
  editFacility,
  getFacilities,
  getFacility,
  newFacility,
  removeFacility,
  updateFacility,
} from "../controllers/facilityController";
import { checkAuthenticated, isAdmin } from "../middlewares/auth";
import validate from "../middlewares/validator";
// import ssrErrorHandler from "../middlewares/ssrErrorHandler";
// import validate from "../middlewares/validator";

const router = express.Router();

// Define routes

// All Facilities Route
router.get("/", checkAuthenticated, getFacilities);

// New Facility Route
router.get("/new", isAdmin, newFacility);

// Show Facility Route
router.get("/:id", checkAuthenticated, getFacility);

// Edit Facility Route
router.get("/:id/edit", isAdmin, editFacility);

// Create Facility Route
router.post("/", isAdmin, validate("facilities", "post"), createFacility);

// Update Facility Route
router.put("/:id", isAdmin, validate("facilities/:id", "put"), updateFacility);

// Delete Facility Route
router.delete("/:id", isAdmin, removeFacility);

export default router;
