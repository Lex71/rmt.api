import { NextFunction, Request, Response } from "express";

import { ITable, TableSearchOptionsType } from "../models/table.ts";
import User from "../models/user.ts";
import * as TableService from "../services/tableService.ts";
import { ApplicationError } from "../utils/errors.ts";

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
    // res.render("tables/index", {
    //   data: tables,
    //   searchOptions: { ...req.query },
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: tables });
  } catch {
    // res.redirect("/");
    next(new ApplicationError(500, "Tables not found"));
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const table = await TableService.findById(req.params.id);
    // res.render("tables/show", {
    //   data: table,
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: table });
  } catch {
    // res.redirect("/");
    next(new ApplicationError(500, "Table not found"));
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { description, name, seats } = req.body as Partial<ITable>;
  // get facility from req.user.facility
  const facility = req.user?.facility;
  /* const table = new Table({
    description,
    facility,
    name,
    seats,
  }); */
  try {
    const newTable = await TableService.create({
      description,
      facility,
      name,
      seats,
    }); //.catch(() => { throw new Error("Cannot create table"); });
    // res.redirect(`tables/${newTable._id.toString()}`);
    res.status(201).json({ data: newTable });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Error creating Table"));
    }
  }
};

/* export const edit = async (req: Request, res: Response) => {
  try {
    const table = await findById(req.params.id);
    res.render("tables/edit", {
      data: table,
      // facility: new User(req.user).facility,
      // // facility: req.user?.facility,
      user: new User(req.user).toJSON(),
    });
    // renderEditPage(req, res, table);
  } catch {
    res.redirect("/tables");
  }
}; */

/* export const newTable = (req: Request, res: Response) => {
  res.render("tables/new", {
    data: new Table(),
    // facility: new User(req.user).facility,
    // // facility: req.user?.facility,
    user: new User(req.user).toJSON(),
  });
  // renderNewPage(req, res, new Table());
}; */

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
    if (table == null) {
      // res.redirect("/");
      next(new ApplicationError(404, "Table non exists"));
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot update table"));
      }
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
    if (table != null) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot remove table"));
      }
      res.render("tables/show", {
        data: table,
        user: new User(req.user).toJSON(),
      });
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Table non exists"));
      }
    }
  }
};

/* function renderEditPage(
  req: Request,
  res: Response,
  table: ITable,
  hasError = false,
) {
  renderFormPage(req, res, table, "edit", hasError);
}

function renderFormPage(
  req: Request,
  res: Response,
  table: ITable,
  form: string,
  hasError = false,
) {
  try {
    const params = {
      table: table,
      // imageMimeTypes,
    };
    if (hasError) {
      if (form === "edit") {
        req.flash("error", "Error Updating Table");
      } else {
        req.flash("error", "Error Creating Table");
      }
    }
    res.render(`tables/${form}`, params);
  } catch {
    res.redirect("/tables");
  }
}

function renderNewPage(
  req: Request,
  res: Response,
  table: ITable,
  hasError = false,
) {
  renderFormPage(req, res, table, "new", hasError);
} */

// if (req.body.cover != null && req.body.cover !== "") {
//   saveCover(table, req.body.cover);
// }

// function saveCover(table, coverEncoded) {
//   if (coverEncoded == null) return;
//   const cover = JSON.parse(coverEncoded);
//   if (cover != null && imageMimeTypes.includes(cover.type)) {
//     table.coverImage = Buffer.from(cover.data, "base64");
//     table.coverImageType = cover.type;
//   }
// }
