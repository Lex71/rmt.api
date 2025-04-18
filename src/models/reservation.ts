import { model, PopulatedDoc, Schema, Types } from "mongoose";

import { QueryOptions } from "../types/index.ts";
import { ITable } from "./table.ts";

export enum Status {
  // AWAITINGPAYMENT = "awaitingpayment", // The booking is confirmed but payment is still pending.
  CANCELLED = "cancelled", // The booking has been canceled by either the customer or the restaurant.
  CHECKEDIN = "checkedin", // The customer has arrived at the restaurant
  CONFIRMED = "confirmed", // The booking has been successfully made and is confirmed by the restaurant.
  NOSHOW = "noshow", // The customer did not show up for the booked reservation (NOTE: remarkable for auditing purposes, to be treated as a cancellation).
  PAID = "paid", // The booking has been confirmed and payment has been received (NOTE: tables are free).
  // PENDING = "pending", // ONLINE: The booking request has been received but is awaiting confirmation from the restaurant.
  RESCHEDULED = "rescheduled", // The booking has been moved to a different date or time (NOTE: remarkable for auditing purposes, to be treated as a confirmed booking).
}

/**
 * ### Booking Flow
 * 1. Customer makes a reservation
 *  1.1. By Phone
 *    1.1.1. Operator is provided with a set of available tables, depending on the number of seats, date and time
 *      The list is composed by:
 *        - all tables having the desired amount of seats (filtered client side) and that are not yet included in any reservation
 *        - tables included in reservations for that date having a status PAID or NOSHOW or CANCELLED
 *        - tables included in reservations for that date having a status CONFIRMED or RESCHEDULED or CHECKEDIN and a time past the booking time + DELAY
 *          NOTE: DELAY is a configurable parameter representing customer's average staying time, in minutes
 *           EXAMPLE:
 *             If the DELAY is 90 minutes, and the new booking time is 14:00, then a table whose status is CONFIRMED or CHECKEDIN that has been reserved for 12:00, will be included in the list (because the customer will probably pay at 13:30, so table is free)
 *             If the DELAY is 90 minutes, and the new booking time is 14:00, then a table whose status is CONFIRMED or CHECKEDIN that has been reserved for 13:00, will not be included in the list (because the customer will probably pay at 13:30, so table is still busy)
 *    1.1.2. Operator selects a table
 *      The reservation is marked with status CONFIRMED
 *
 *  1.2. By Web App (coming soon)
 *
 * 2. Operator manages the reservation
 *  2.1. Customer shows up at the restaurant in time
 *    The reservation is marked with status CHECKEDIN
 *  2.2. After some time, customer still didn't show up
 *      The reservation is marked with status NOSHOW
 *
 *
 * 3. Customer pays for the reservation
 *  The reservation is marked with status PAID
 */

// 1. Create an interface representing a document in MongoDB.
export interface IReservation /* extends Document */ {
  date: string;
  name: string;
  time: string;
  phone: string;
  seats: number;
  status: Status;
  facility: Types.ObjectId;
  tables: PopulatedDoc<ITable>[];
}

export interface ReservationSearchOptionsType {
  page?: number; // Optional page number for pagination
  sortBy?: string; // Optional field to sort by
  pageSize?: number; // Optional page size for pagination
  sortOrder?: "asc" | "desc"; // Optional sort order, ascending or descending
  query?: Partial<Omit<QueryOptions<IReservation>, "_id">>; // Optional search query, all searchable fields except _id
}

export const reservationSchema = new Schema(
  {
    // date: { required: true, type: Date },
    date: {
      type: String,
      validate: {
        message: (props: { value: string }) =>
          `${props.value} is not a valid date!`,
        validator: function (v: string) {
          if (!v) {
            return true;
          }
          // return /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/.test(v); // optional leading 0
          return /^\d{4}-(0?[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(v);
        },
      },
    },
    facility: { ref: "Facility", required: true, type: Schema.Types.ObjectId },
    name: { required: true, type: String },
    phone: { required: true, type: String },
    seats: { required: true, type: Number },
    status: {
      default: Status.CONFIRMED,
      enum: Object.values(Status),
      type: String,
    },
    // tables: { ref: "Table", required: true, type: [Schema.Types.ObjectId] },
    tables: [
      {
        default: [],
        ref: "Table",
        required: true,
        type: Schema.Types.ObjectId,
      },
    ],
    // time: { required: true, type: Date },
    time: {
      type: String,
      validate: {
        message: (props: { value: string }) =>
          `${props.value} is not a valid time!`,
        validator: function (v: string) {
          if (!v) {
            return true;
          }
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
      },
    },
  },
  {
    timestamps: true,
  },
);

/* reservationSchema.add({
  status: {
    default: Status.CONFIRMED,
    enum: Object.values(Status),
    type: String,
  },
}); */

const Reservation = model("Reservation", reservationSchema);

export default Reservation;
