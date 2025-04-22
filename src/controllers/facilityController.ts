import { NextFunction, Request, Response } from "express";

import Facility, {
  FacilitySearchOptionsType,
  IFacility,
} from "../models/facility.ts";
// import User from "../models/user.ts";
import * as FacilityService from "../services/facilityService.ts";
import { ApplicationError } from "../utils/errors.ts";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // handle req.query
  const searchOptions: FacilitySearchOptionsType = {};
  searchOptions.query = {};
  // search by name
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.query.name = req.query.name as string;
  }
  // search by address
  if (req.query.address != null && req.query.address !== "") {
    searchOptions.query.address = req.query.address as string;
  }

  try {
    const facilities = await FacilityService.find(searchOptions);
    // res.render("facilities/index", {
    //   data: facilities,
    //   searchOptions: { ...req.query },
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: facilities });
  } catch {
    // res.redirect("/");
    next(new ApplicationError(500, "Facilities not found"));
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const facility = await FacilityService.findById(req.params.id);
    // res.render("facilities/show", {
    //   data: facility,
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: facility });
  } catch (err) {
    console.log(err);
    // res.redirect("/");
    next(new ApplicationError(500, "Facility not found"));
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { address, name } = req.body as Partial<IFacility>;
  const facility = new Facility({
    address,
    name,
    tables: [],
  });
  try {
    const newFacility = await FacilityService.create(facility);
    // res.redirect(`facilities/${newFacility._id.toString()}`);
    res.status(201).json({ data: newFacility });
  } catch {
    // req.flash("error", "Cannot create facility");
    // res.render("facilities/new", {
    //   data: facility,
    //   // messages: "Error creating Facility",
    // });
    // // renderNewPage(req, res, table, true);
    next(new ApplicationError(500, "Error creating Facility"));
  }
};

/* export const edit = async (req: Request, res: Response) => {
  try {
    const facility = await findById(req.params.id);
    res.render("facilities/edit", {
      data: facility,
      user: new User(req.user).toJSON(),
    });
    // renderEditPage(req, res, table);
  } catch {
    res.redirect("/facilities");
  }
}; */

/* export const newFacility = (req: Request, res: Response) => {
  res.render("facilities/new", {
    data: new Facility(),
    user: new User(req.user).toJSON(),
  });
  // renderNewPage(req, res, new Table());
}; */

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let facility = null;
  try {
    const { address, name } = req.body as IFacility;
    facility = await FacilityService.update(req.params.id, {
      address,
      name,
    });
    // if (facility != null) res.redirect(`/facilities/${req.params.id}`);
    // else res.redirect("/");

    if (facility != null) res.status(200).json({ data: facility });
    else next(new ApplicationError(404, "Facility non exists"));
  } catch (err: unknown) {
    if (facility == null) {
      // res.redirect("/");
      next(new ApplicationError(404, "Facility non exists"));
    } else {
      if (err instanceof Error) {
        // req.flash("error", err.message);
        next(new ApplicationError(500, err.message));
      } else {
        // req.flash("error", "Cannot update facility");
        next(new ApplicationError(500, "Cannot update facility"));
      }
      // res.render("facilities/edit", {
      //   data: facility,
      //   user: new User(req.user).toJSON(),
      //   // messages: "Error updating Facility",
      // });
      // // renderEditPage(req, res, table, true);
    }
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let facility = null;
  try {
    // facility = await findById(req.params.id);
    // if (facility) {
    //   await facility.deleteOne();
    //   res.redirect("/facilities");
    // }
    facility = await FacilityService.findById(req.params.id);
    await FacilityService.remove(req.params.id);
    // res.redirect("/facilities");
    res.status(200).json({ data: facility });
    // or send status 204 and empty data
  } catch (err: unknown) {
    if (facility != null) {
      if (err instanceof Error) {
        // req.flash("error", err.message);
        next(new ApplicationError(500, err.message));
      } else {
        // req.flash("error", "Cannot remove facility");
        next(new ApplicationError(500, "Cannot remove facility"));
      }

      // res.render("facilities/show", {
      //   data: facility,
      //   user: new User(req.user).toJSON(),
      //   // messages: "Could not remove facility",
      // });
    } else {
      // res.redirect("/");
      if (err instanceof Error) {
        // req.flash("error", err.message);
        next(new ApplicationError(500, err.message));
      } else {
        // req.flash("error", "Cannot remove facility");
        next(new ApplicationError(500, "Facility non exists"));
      }
    }
  }
};
