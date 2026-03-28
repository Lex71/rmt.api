// import moment from "moment";
import mongoose, {
  HydratedDocument,
  MongooseError,
  // PopulatedDoc,
  Types,
} from "mongoose";

import config from "../../config/config";
import Facility from "../../models/facility";
import Reservation, {
  IReservation,
  ReservationSearchOptionsType,
  Status,
  reservationSchema,
} from "../../models/reservation";
import Table, { ITable } from "../../models/table";
import { timeOverlaps } from "../../utils/helpers";

export const findById = async (
  id: string,
): Promise<HydratedDocument<unknown> | null> => {
  // ): Promise<HydratedDocument<IReservation> | null> => {
  // ): Promise<HydratedDocument<unknown, unknown, IReservation> & IReservation & { tables: Types.ObjectId[] } | null> => {
  try {
    // return await Reservation.findById(id);
    const reservation = await Reservation.findById(id)
      .populate<{ tables: Types.ObjectId[] }>("tables")
      .orFail();
    return reservation;
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Reservation not found");
  }
};

export const find = async (
  searchOptions?: ReservationSearchOptionsType,
): Promise<HydratedDocument<unknown>[] | null> => {
  try {
    let query = Reservation.find();
    // add regex filters to query
    if (
      searchOptions?.query != null &&
      Object.keys(searchOptions.query).length
    ) {
      for (const [k, v] of Object.entries(searchOptions.query)) {
        if (typeof v === "string" && v != "") {
          switch (reservationSchema.path(k).instance) {
            // case "Date":
            //   // query = query.where(k, new Date(v));
            //   query = query.where(k, v);
            //   break;
            case "Number":
              query = query.where(k, Number(v));
              break;
            default:
              if (k === "facility") {
                query = query.where(k, new Types.ObjectId(v));
                break;
              }
              query = query.regex(k, new RegExp(v, "i"));
              break;
          }
        }
      }
    }
    query = query.sort({ date: 1, time: 1 });
    return await query.populate<{ tables: Types.ObjectId[] }>("tables").exec();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot find Reservations");
  }
};

export const findAvailableTables = async (
  adjust: number,
  searchOptions?: ReservationSearchOptionsType,
): Promise<ITable[]> => {
  const DELAY: number = config.AVERAGE_STAYING_TIME;
  try {
    let query = Reservation.find();
    // .populate<{ tables: Types.ObjectId[] }>(
    //   "tables",
    // );
    let booking_time = "";
    // add filters to query
    if (
      searchOptions?.query != null &&
      Object.keys(searchOptions.query).length
    ) {
      for (const [k, v] of Object.entries(searchOptions.query)) {
        if (typeof v === "string" && v != "") {
          switch (reservationSchema.path(k).instance) {
            case "Number":
              query = query.where(k, Number(v));
              break;
            default:
              // query = query.regex(k, new RegExp(v, "i"));
              if (k === "facility") {
                query = query.where(k, new Types.ObjectId(v));
                break;
              }
              if (k === "time") {
                booking_time = v;
                break;
              }
              query = query.where(k, v);
              break;
          }

          /* switch (k) {
            case "date":
              query = query.where(k, v);
              break;
            default:
              if (k === "facility") {
                query = query.where(k, new Types.ObjectId(v));
                break;
              }
              if (k === "time") {
                booking_time = v;
                break;
              }
              query = query.where(k, v);
              break;
          } */
        }
      }
    }

    // if (!booking_time) throw new Error("Missing time query parameter");
    const reservations = await query.populate("tables").exec();
    const allTables: (ITable & { _id: Types.ObjectId })[] = await Table.find({
      facility: searchOptions?.query?.facility,
    });
    const busyTablesIds: string[] = [];

    reservations.forEach((reservation) => {
      // if time values are "empty" (for unknown reasons), set isOverlapping equals true
      // this way, the reservation will be considered "busy"
      const isOverlapping: boolean =
        reservation.time && booking_time
          ? timeOverlaps(reservation.time, booking_time, adjust, DELAY)
          : true;

      const busyTables = reservation.tables.filter(() => {
        return (
          ![Status.CANCELLED, Status.NOSHOW, Status.PAID].includes(
            reservation.status,
          ) &&
          [Status.CHECKEDIN, Status.CONFIRMED, Status.RESCHEDULED].includes(
            reservation.status,
          ) &&
          isOverlapping
        );
      });
      busyTablesIds.push(...busyTables.map((t) => t._id.toString()));
    });

    return allTables.filter(
      (table) => !busyTablesIds.includes(table._id.toString()),
    );
  } catch (err) {
    if (err instanceof MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot find available tables");
  }
};

export const create = async (body: Partial<IReservation>) => {
  const { date, facility, name, phone, seats, tables, time } = body;

  try {
    const f = await Facility.findById(facility);
    if (f) {
      return await Reservation.create({
        date,
        facility,
        name,
        phone,
        seats,
        tables,
        time,
      });
    } else {
      throw new Error("Cannot create Reservation without Facility");
    }
  } catch (err) {
    if (err instanceof MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Error creating  reservation");
  }
};

export const update = async (id: string, body: Partial<IReservation>) => {
  try {
    return await Reservation.findByIdAndUpdate(id, body, {
      new: true,
    }).orFail();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Error updating reservation");
  }
};

export const remove = async (id: string) => {
  try {
    // return await Reservation.deleteOne({ _id: id });
    return await Reservation.findByIdAndDelete(id);
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot deleteOne: Reservation not found");
  }
};
