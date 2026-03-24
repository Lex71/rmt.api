import { model, PopulatedDoc, Schema, Types } from "mongoose";

import { QueryOptions } from "../types/index";
import { ITable } from "./table";

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

interface BaseEntity {
  createdAt?: Date;
  updatedAt?: Date;
  _id?: Types.ObjectId;
}

// 1. Create an interface representing a document in MongoDB.
export interface IReservation /* extends Document */ extends BaseEntity {
  date: string;
  name: string;
  time: string;
  phone: string;
  seats: number;
  status: Status;
  // _id: Types.ObjectId;
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
