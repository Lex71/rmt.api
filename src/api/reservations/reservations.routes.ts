import express from "express";

import { checkAuthenticated } from "../../middlewares/auth";
import validate from "../../middlewares/yup.validator";
import {
  create,
  getAll,
  getById,
  getReservableTables,
  // newReservation,
  patch,
  remove,
  update,
} from "./reservations.controller";
// import validate from "../middlewares/validator";

const router = express.Router();

// Define routes

// All Reservations Route
router.get("/", checkAuthenticated, getAll);

// // New Reservation Route
// router.get("/new", checkAuthenticated, newReservation);

// API getReservableTables
router.get("/tables", checkAuthenticated, getReservableTables);

// Show Reservation Route
router.get("/:id", checkAuthenticated, getById);

// Status change
// router.get("/:id/:status", checkAuthenticated, updateStatusReservation);

// Create Reservation Route
router.post(
  "/",
  [checkAuthenticated, validate("reservations", "post")],
  create,
);

// Update Reservation Route
router.put(
  "/:id",
  [checkAuthenticated, validate("reservations/:id", "put")],
  update,
);

// Patch Reservation Route
router.patch(
  "/:id",
  [checkAuthenticated, validate("reservations/:id", "patch")],
  patch,
);

// Delete Reservation Route
router.delete("/:id", checkAuthenticated, remove);

export default router;
