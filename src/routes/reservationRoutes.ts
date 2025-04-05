import express from "express";

import {
  createReservation,
  editReservation,
  getReservableTables,
  getReservation,
  getReservations,
  newReservation,
  removeReservation,
  updateReservation,
} from "../controllers/reservationController";
import { checkAuthenticated } from "../middlewares/auth";
// import ssrErrorHandler from "../middlewares/ssrErrorHandler";
// import validate from "../middlewares/validator";

const router = express.Router();

// Define routes

// All Reservations Route
router.get("/", checkAuthenticated, getReservations);

// New Reservation Route
router.get("/new", checkAuthenticated, newReservation);

// API getReservableTables
router.get("/tables", getReservableTables);

// Show Reservation Route
router.get("/:id", checkAuthenticated, getReservation);

// Edit Reservation Route
router.get("/:id/edit", checkAuthenticated, editReservation);

// Create Reservation Route
router.post("/", checkAuthenticated, createReservation);

// Update Reservation Route
router.put("/:id", checkAuthenticated, updateReservation);

// Delete Reservation Route
router.delete("/:id", checkAuthenticated, removeReservation);

export default router;
