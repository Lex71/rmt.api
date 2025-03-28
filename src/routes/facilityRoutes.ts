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

import ssrErrorHandler from "../middlewares/ssrErrorHandler";

import validate from "../middlewares/validator";

import { Request, Response } from "express";

const router = express.Router();

// Define routes

// All Facilities Route
router.get("/", checkAuthenticated, getFacilities);
// router.get("/", (req: Request, res: Response) => {
//   res.send({ name: req.query.name });
// });

// New Facility Route
router.get("/new", isAdmin, newFacility);

// Show Facility Route
router.get("/:id", checkAuthenticated, getFacility);

// Edit Facility Route
router.get("/:id/edit", isAdmin, editFacility);

// Create Facility Route
router.post(
  "/",
  isAdmin,
  createFacility,
  // ssrErrorHandler({
  //   render: "facilities/new",
  //   messages: "Error creating Facility",
  // }),
);

// Update Facility Route
router.put("/:id", isAdmin, updateFacility);

// Delete Facility Route
router.delete("/:id", isAdmin, removeFacility);

export default router;
