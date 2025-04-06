import { Request, Response } from "express";

import config from "../config/config";
import Reservation, {
  IReservation,
  ReservationSearchOptionsType,
  Status,
} from "../models/reservation";
import { TableSearchOptionsType } from "../models/table";
import User from "../models/user";
import {
  create,
  find,
  findAvailableTables,
  findById,
  remove,
  update,
} from "../services/reservationService";
import { find as findTables } from "../services/tableService";
import { ApplicationError } from "../utils/errors";

export const getReservations = async (req: Request, res: Response) => {
  // handle req.query
  const searchOptions: ReservationSearchOptionsType = {};
  searchOptions.query = {};
  // search by name
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.query.name = req.query.name as string;
  }
  // search by date
  if (req.query.date != null && req.query.date !== "") {
    searchOptions.query.date = req.query.date as string;
  }
  // search by phone
  if (req.query.phone != null && req.query.phone !== "") {
    searchOptions.query.phone = req.query.phone as string;
  }

  try {
    const reservations = await find(searchOptions);
    res.render("reservations/index", {
      data: reservations,
      // facility: req.user?.facility,
      searchOptions: { ...req.query },
      user: new User(req.user).toJSON(),
    });
  } catch {
    res.redirect("/");
  }
};

export const getReservation = async (req: Request, res: Response) => {
  try {
    const reservation = await findById(req.params.id);
    res.render("reservations/show", {
      data: reservation,
      // facility: req.user?.facility,
      user: new User(req.user).toJSON(),
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
};

export const createReservation = async (req: Request, res: Response) => {
  const { date, facility, name, phone, seats, tables, time } =
    req.body as Partial<IReservation>;
  console.log(tables);
  // const reservation = new Reservation({
  //   date,
  //   facility,
  //   name,
  //   phone,
  //   seats,
  //   tables,
  //   time,
  // });
  try {
    const newReservation = await create({
      date,
      facility,
      name,
      phone,
      seats,
      tables,
      time,
    });
    res.redirect(`reservations/${newReservation._id.toString()}`);
  } catch {
    const searchOptions: TableSearchOptionsType = {};
    searchOptions.query = { facility: req.user?.facility };
    const tables = await findTables(searchOptions);
    req.flash("error", "Cannot create reservation");
    res.render("reservations/new", {
      data: { date, name, phone, seats, time },
      // facility: new User(req.user).facility,
      facility: req.user?.facility,
      tables,
      // user: new User(req.user).toJSON(),
      // messages: "Error creating Reservation",
    });
    // renderNewPage(req, res, table, true);
  }
};

export const editReservation = async (req: Request, res: Response) => {
  try {
    const reservation = await findById(req.params.id);
    res.render("reservations/edit", {
      data: reservation,
      // facility: new User(req.user).facility,
      facility: req.user?.facility,
      status_enum: Status,
      user: new User(req.user).toJSON(),
    });
    // renderEditPage(req, res, table);
  } catch {
    res.redirect("/reservations");
  }
};

export const newReservation = async (req: Request, res: Response) => {
  const searchOptions: TableSearchOptionsType = {};
  searchOptions.query = { facility: req.user?.facility };
  // initially send all tables
  // TODO make ajax call from client to getReservableTables, so here send an empty array
  const tables = await findTables(searchOptions);
  res.render("reservations/new", {
    data: new Reservation(),
    // facility: new User(req.user).facility,
    facility: req.user?.facility,
    tables,
    user: new User(req.user).toJSON(),
  });
  // renderNewPage(req, res, new Table());
};

export const getReservableTables = async (req: Request, res: Response) => {
  const DELAY = config.AVERAGE_STAYING_TIME;
  // const facility = new User(req.user).facility;
  const delay =
    req.query.delay != null && req.query.delay != ""
      ? parseInt(req.query.delay as string)
      : DELAY;
  const { date, time } = req.query;
  // handle req.query
  const searchOptions: ReservationSearchOptionsType = {};
  searchOptions.query = {};
  // search by date
  if (date != null && date !== "") {
    searchOptions.query.date = date as string;
  }
  // search by time
  if (time != null && time !== "") {
    searchOptions.query.time = time as string;
  }
  // TODO check this after route has middleware guard...
  if (req.query.facility != null && req.query.facility != "") {
    searchOptions.query.facility = req.query.facility as string;
  } else {
    searchOptions.query.facility = req.user?.facility?.toString();
  }

  try {
    const data = await findAvailableTables(delay, searchOptions);
    res.status(200).json({ data });
    // res.status(200).json({ message: "OK!" });
  } catch {
    throw new ApplicationError(403, "Cannot get reservable tables");
  }
};

export const updateReservation = async (req: Request, res: Response) => {
  let reservation = null;
  try {
    const { date, name, phone, seats, tables, time } =
      req.body as Partial<IReservation>;
    reservation = await update(req.params.id, {
      date,
      name,
      phone,
      seats,
      tables,
      time,
    });
    if (reservation != null) res.redirect(`/reservations/${req.params.id}`);
    else res.redirect("/");
  } catch {
    if (reservation == null) {
      res.redirect("/");
    } else {
      req.flash("error", "Cannot update reservation");
      res.render("reservations/edit", {
        data: reservation,
        // facility: new User(req.user).facility,
        facility: req.user?.facility,
        user: new User(req.user).toJSON(),
        // messages: "Error updating Reservation",
      });
      // renderEditPage(req, res, table, true);
    }
  }
};

export const removeReservation = async (req: Request, res: Response) => {
  let reservation = null;
  try {
    // reservation = await findById(req.params.id);
    // if (reservation) {
    //   await reservation.deleteOne();
    //   res.redirect("/reservations");
    // }
    reservation = await findById(req.params.id);
    await remove(req.params.id);
    res.redirect("/reservations");
  } catch {
    if (reservation != null) {
      req.flash("error", "Cannot remove reservation");
      res.render("reservations/show", {
        data: reservation,
        // facility: new User(req.user).facility,
        facility: req.user?.facility,
        user: new User(req.user).toJSON(),
        // messages: "Could not remove reservation",
      });
    } else {
      res.redirect("/");
    }
  }
};
