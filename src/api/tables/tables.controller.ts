import { NextFunction, Request, Response } from "express";

import { Types } from "mongoose";
import { ITable, TableSearchOptionsType } from "../../models/table";
import { ApplicationError } from "../../utils/errors";
import * as TableService from "./tables.service";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // handle req.query
  const searchOptions: TableSearchOptionsType = {};

  searchOptions.query = {};
  // search by name
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.query.name = req.query.name as string;
  }
  // search by description
  if (req.query.seats != null && req.query.seats !== "") {
    searchOptions.query.seats = req.query.seats as string;
  }

  // must be filtered by facility, if req.user.facility is set (for admin it is not set, for user it is set)
  const facility = req.user?.facility;
  if (facility) {
    // normal user
    searchOptions.query.facility = facility.toString();
  } else {
    if (req.query.facility != null && req.query.facility !== "") {
      searchOptions.query.facility = req.query.facility as string;
    }
  }

  let tables = [];
  try {
    tables = await TableService.find(searchOptions);
    res.status(200).json({ data: tables });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Cannot getAll tables"));
    }
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const table = await TableService.findById(req.params.id);
    res.status(200).json({ data: table });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Table not found"));
    }
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // next(new ApplicationError(403, "Test Error"));
  // return;
  const { description, name, seats } = req.body as Partial<ITable>;
  // get facility from req.user.facility
  // const facility = req.user?.facility;
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
    const newTable = await TableService.create({
      description,
      facility,
      name,
      seats,
    });
    res.status(201).json({ data: newTable });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Error creating table"));
    }
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let table = null;
  try {
    table = await TableService.findById(req.params.id);
    await TableService.remove(req.params.id);
    res.status(200).json({ data: table });
  } catch (err: unknown) {
    if (table !== null) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot remove table"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(404, err.message));
      } else {
        next(new ApplicationError(404, "Table not exists"));
      }
    }
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let table = null;
  // cannot change facility!
  const { description, name, seats } = req.body as Partial<ITable>;
  try {
    table = await TableService.update(req.params.id, {
      description,
      name,
      seats,
    });

    res.status(200).json({ data: table });
  } catch (err: unknown) {
    if (table !== null) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Error updating table"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Table not exists"));
      }
    }
  }
};

export const patch = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let table = null;
  try {
    const body = req.body as Partial<ITable>;
    table = await TableService.update(req.params.id, body);
    res.status(200).json({ data: table });
  } catch (err: unknown) {
    if (table == null) {
      next(new ApplicationError(404, "Table not exists"));
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Error updating table"));
      }
    }
  }
};
