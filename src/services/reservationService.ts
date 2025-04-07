import moment from "moment";
import { MongooseError, Types } from "mongoose";

import config from "../config/config";
import Facility from "../models/facility";
import Reservation, {
  IReservation,
  reservationSchema,
  ReservationSearchOptionsType,
  Status,
} from "../models/reservation";
import Table from "../models/table";

export const findById = async (id: string) => {
  try {
    // return await Reservation.findById(id);
    return await Reservation.findById(id)
      .populate<{ tables: Types.ObjectId[] }>("tables")
      .orFail();
  } catch {
    throw new Error("Reservation not found");
  }
};

export const find = async (searchOptions?: ReservationSearchOptionsType) => {
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
              query = query.regex(k, new RegExp(v, "i"));
              break;
          }
        }
      }
    }

    return await query.exec();
  } catch {
    throw new Error("Cannot find Reservations");
  }
};

export const findAvailableTables = async (
  adjust: number,
  searchOptions?: ReservationSearchOptionsType,
) => {
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
        /* if (k === "date") {
          // query = query.where(k, new Date(v));
          query = query.where(k, v);
        } else if (k === "time") {
          booking_time = v;
        } */
        if (typeof v === "string" && v != "") {
          switch (reservationSchema.path(k).instance) {
            // case "Date":
            //   // query = query.where(k, new Date(v));
            //   // no need to filter by exact time, but afterwards by custom logic
            //   if (k === "time") {
            //     booking_time = v;
            //     break;
            //   }
            //   query = query.where(k, v);
            //   // query = query.where(k, new Date(v));
            //   break;
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
        }
      }
    }

    if (!booking_time) throw new Error("Missing time query parameter");
    const reservations = await query.populate("tables").exec();
    console.log(reservations);
    /* const r = await Reservation.find({
      date: { $eq: "2025-04-02" }, // "2025-04-02",
      facility: new Types.ObjectId(searchOptions?.query?.facility),
    }); //.populate<{ tables: ITable[] }>("tables");
    console.log(r); */
    const allTables = await Table.find();

    // return await query.exec();
    const busyTablesIds: string[] = [];

    reservations.forEach((reservation) => {
      const res = reservation.tables.filter(() => {
        return (
          ![Status.CANCELLED, Status.NOSHOW, Status.PAID].includes(
            reservation.status,
          ) &&
          [Status.CHECKEDIN, Status.CONFIRMED, Status.RESCHEDULED].includes(
            reservation.status,
          ) &&
          moment(booking_time, "HH:mm")
            .add(adjust, "minutes")
            .isSameOrAfter(moment(reservation.time, "HH:mm")) &&
          moment(booking_time, "HH:mm")
            .add(adjust, "minutes")
            .isSameOrBefore(
              moment(reservation.time, "HH:mm").add(DELAY, "minutes"),
            )
        );
      });
      busyTablesIds.push(...res.map((t) => t._id.toString()));
    });
    return allTables.filter(
      (table) => !busyTablesIds.includes(table._id.toString()),
    );
  } catch {
    throw new Error("Cannot find Reservations");
  }
};

export const create = async (body: Partial<IReservation>) => {
  /* const { date, facility, name, phone, seats, tables, time } = body;

  const reservation = new Reservation({
    date,
    facility,
    name,
    phone,
    seats,
    tables,
    time,
  });

  try {
    return await reservation.save();
  } catch {
    throw new Error("Cannot create Reservation");
  } */
  const { date, facility, name, phone, seats, time } = body;
  const tables = body.tables ? (body.tables as Types.ObjectId[]) : [];

  try {
    // if (facility != null) {
    const f = await Facility.findById(facility);
    if (f) {
      const newReservation = new Reservation({
        // date: new Date(date ?? ""),
        date,
        facility,
        name,
        phone,
        seats,
        tables,
        time,
      });
      // save the reservation
      await newReservation.save();
      return newReservation;
    } else {
      throw new Error("Cannot create Reservation because cannot find Facility");
    }
  } catch (err: unknown) {
    if (err instanceof MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    throw new Error("Cannot create Reservation");
  }
};

export const update = async (id: string, body: Partial<IReservation>) => {
  // let reservation: IReservation | null = null;
  // try {
  //   reservation = await Reservation.findById(id);
  //   if (reservation) {
  //     reservation.name = body.name;
  //     reservation.address = body.address;
  //     await reservation.save();
  //     return reservation;
  //   }
  // } catch (err) {
  //   throw new Error("Cannot update: Reservation not found");
  // }
  try {
    return await Reservation.findByIdAndUpdate(id, body, { new: true });
  } catch {
    throw new Error("Cannot update: Reservation not found");
  }
};

export const remove = async (id: string) => {
  try {
    return await Reservation.deleteOne({ _id: id });
  } catch {
    throw new Error("Cannot deleteOne: Reservation not found");
  }
};
