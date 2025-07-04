import { NextFunction, Request, Response } from "express";
// import moment from "moment";

import {
  IReservation,
  ReservationSearchOptionsType,
} from "../../models/reservation";

import { ITable } from "../../models/table";

// import { TableSearchOptionsType } from "../models/table";
import * as ReservationService from "./reservations.service";
// import { find as findTables } from "../services/tableService";
import { Types } from "mongoose";
import { ApplicationError } from "../../utils/errors";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  const facility = req.user?.facility;
  if (facility) {
    // normal user
    searchOptions.query.facility = facility.toString();
  } else {
    if (req.query.facility != null && req.query.facility !== "") {
      searchOptions.query.facility = req.query.facility as string;
    }
  }

  try {
    const reservations = await ReservationService.find(searchOptions);
    // res.render("reservations/index", {
    //   data: reservations,
    //   // facility: req.user?.facility,
    //   searchOptions: { ...req.query },
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: reservations });
  } catch {
    // res.redirect("/");
    next(new ApplicationError(500, "Cannot getAll reservations"));
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reservation = await ReservationService.findById(req.params.id);
    // res.render("reservations/show", {
    //   data: reservation,
    //   // facility: req.user?.facility,
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: reservation });
  } catch (err) {
    console.log(err);
    // res.redirect("/");
    next(new ApplicationError(500, "Reservation not found"));
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { date, name, phone, seats, tables, time } =
    req.body as Partial<IReservation>;
  let facility = req.user?.facility;
  if (!facility) {
    if (req.query.facility != null && req.query.facility !== "") {
      facility = new Types.ObjectId(req.query.facility as string);
    }
  }
  if (!facility) {
    next(new ApplicationError(403, "Facility missing"));
    return;
  }

  try {
    const newReservation = await ReservationService.create({
      date,
      facility,
      name,
      phone,
      seats,
      tables,
      time,
    });
    res.status(201).json({ data: newReservation });
  } catch {
    next(new ApplicationError(500, "Cannot create reservation"));
  }
};

// REVIEW: can be called instead of getById, in order to get status_enum extra data
// TODO: maybe accept this as required endpoint (for all resources)
/* export const edit = async (req: Request, res: Response) => {
  try {
    const reservation = await ReservationService.findById(req.params.id);
    // res.render("reservations/edit", {
    //   data: reservation,
    //   // facility: new User(req.user).facility,
    //   // // facility: req.user?.facility,
    //   status_enum: Status,
    //   tables: [],
    //   user: new User(req.user).toJSON(),
    // });
    // // renderEditPage(req, res, table);
    res.status(200).json({ data: reservation, status_enum: Status });
  } catch {
    res.redirect("/reservations");
  }
}; */

/* export const newReservation = (req: Request, res: Response) => {
  // const searchOptions: TableSearchOptionsType = {};
  // searchOptions.query = { facility: req.user?.facility };
  // initially send all tables
  // TODO make ajax call from client to getReservableTables, so here send an empty array
  // const tables = await findTables(searchOptions);
  res.render("reservations/new", {
    adjust: 0,
    data: new Reservation(),
    // facility: new User(req.user).facility,
    // // facility: req.user?.facility,
    tables: [], // there is an ajax fetch call to getReservableTables
    user: new User(req.user).toJSON(),
  });
  // renderNewPage(req, res, new Table());
}; */

export const getReservableTables = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // const facility = new User(req.user).facility;
  const adjust =
    req.query.adjust != null && req.query.adjust != ""
      ? parseInt(req.query.adjust as string)
      : 0;
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
  const facility = req.user?.facility;
  if (facility) {
    // normal user
    searchOptions.query.facility = facility.toString();
  } else {
    if (req.query.facility != null && req.query.facility !== "") {
      searchOptions.query.facility = req.query.facility as string;
    }
  }

  if (!time) {
    next(new ApplicationError(400, "Missing time query parameter"));
    return;
  }
  if (!searchOptions.query.facility) {
    next(new ApplicationError(400, "Missing facility parameter"));
    return;
  }

  try {
    const at: ITable[] = await ReservationService.findAvailableTables(
      adjust,
      searchOptions,
    );
    res.status(200).json({ data: at });
    // res.status(200).json({ message: "OK!" });
  } catch {
    next(new ApplicationError(500, "Cannot get reservable tables"));
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let reservation = null;
  try {
    // cannot update facility
    const { date, name, phone, seats, status, tables, time } =
      req.body as Partial<IReservation>;
    reservation = await ReservationService.update(req.params.id, {
      date,
      name,
      phone,
      seats,
      status,
      tables,
      time,
    });
    // if (reservation != null) res.redirect(`/reservations/${req.params.id}`);
    // else res.redirect("/");

    res.status(200).json({ data: reservation });
  } catch (err: unknown) {
    if (reservation == null) {
      next(new ApplicationError(404, "Reservation non exists"));
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot update reservation"));
      }
    }
  }
};

export const patch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let reservation = null;
  try {
    const body = req.body as Partial<IReservation>;
    reservation = await ReservationService.update(req.params.id, body);
    res.status(200).json({ data: reservation });
  } catch (err: unknown) {
    if (reservation == null) {
      next(new ApplicationError(404, "Reservation non exists"));
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot update reservation"));
      }
    }
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let reservation = null;
  try {
    reservation = await ReservationService.findById(req.params.id);
    await ReservationService.remove(req.params.id);
    res.status(200).json({ data: reservation });
    // or send status 204 and empty data
  } catch (err: unknown) {
    if (reservation != null) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot remove reservation"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(404, err.message));
      } else {
        next(new ApplicationError(404, "Reservation non exists"));
      }
    }
  }
};
