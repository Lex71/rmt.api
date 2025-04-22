import express from "express";

import {
  createReservation,
  editReservation,
  getReservableTables,
  getReservation,
  getReservations,
  // newReservation,
  patchReservation,
  removeReservation,
  updateReservation,
} from "../controllers/reservationController.ts";
import { checkAuthenticated } from "../middlewares/auth.ts";
import validate from "../middlewares/validator.ts";
// import ssrErrorHandler from "../middlewares/ssrErrorHandler";
// import validate from "../middlewares/validator.ts";

const router = express.Router();

// Define routes

// All Reservations Route
router.get("/", checkAuthenticated, getReservations);

// // New Reservation Route
// router.get("/new", checkAuthenticated, newReservation);

// API getReservableTables
router.get("/tables", getReservableTables);

// Show Reservation Route
router.get("/:id", checkAuthenticated, getReservation);

// Edit Reservation Route
router.get("/:id/edit", checkAuthenticated, editReservation);

// Status change
// router.get("/:id/:status", checkAuthenticated, updateStatusReservation);

// Create Reservation Route
router.post(
  "/",
  checkAuthenticated,
  validate("reservations", "post"),
  createReservation,
);

// Update Reservation Route
router.put(
  "/:id",
  checkAuthenticated,
  validate("reservations/:id", "put"),
  updateReservation,
);

// Patch Reservation Route
router.patch(
  "/:id",
  checkAuthenticated,
  validate("reservations/:id", "patch"),
  patchReservation,
);

// Delete Reservation Route
router.delete("/:id", checkAuthenticated, removeReservation);

export default router;
