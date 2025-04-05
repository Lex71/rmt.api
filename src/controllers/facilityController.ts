import { Request, Response } from "express";

import Facility, {
  FacilitySearchOptionsType,
  IFacility,
} from "../models/facility";
import User from "../models/user";
import {
  create,
  find,
  findById,
  remove,
  update,
} from "../services/facilityService";

export const getFacilities = async (req: Request, res: Response) => {
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
    const facilities = await find(searchOptions);
    res.render("facilities/index", {
      data: facilities,
      searchOptions: { ...req.query },
      user: new User(req.user).toJSON(),
    });
  } catch {
    res.redirect("/");
  }
};

export const getFacility = async (req: Request, res: Response) => {
  try {
    const facility = await findById(req.params.id);
    res.render("facilities/show", {
      data: facility,
      user: new User(req.user).toJSON(),
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
};

export const createFacility = async (req: Request, res: Response) => {
  const { address, name } = req.body as Partial<IFacility>;
  const facility = new Facility({
    address,
    name,
    tables: [],
  });
  try {
    const newFacility = await create(facility);
    // const newFacility = await facility.save();
    res.redirect(`facilities/${newFacility._id.toString()}`);
  } catch {
    req.flash("error", "Cannot create facility");
    res.render("facilities/new", {
      data: facility,
      // messages: "Error creating Facility",
    });
    // renderNewPage(req, res, table, true);
  }
};

export const editFacility = async (req: Request, res: Response) => {
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
};

export const newFacility = (req: Request, res: Response) => {
  res.render("facilities/new", {
    data: new Facility(),
    user: new User(req.user).toJSON(),
  });
  // renderNewPage(req, res, new Table());
};

export const updateFacility = async (req: Request, res: Response) => {
  let facility = null;
  try {
    const { address, name } = req.body as Partial<IFacility>;
    facility = await update(req.params.id, {
      address,
      name,
    });
    if (facility != null) res.redirect(`/facilities/${req.params.id}`);
    else res.redirect("/");
  } catch {
    if (facility == null) {
      res.redirect("/");
    } else {
      req.flash("error", "Cannot update facility");
      res.render("facilities/edit", {
        data: facility,
        user: new User(req.user).toJSON(),
        // messages: "Error updating Facility",
      });
      // renderEditPage(req, res, table, true);
    }
  }
};

export const removeFacility = async (req: Request, res: Response) => {
  let facility = null;
  try {
    // facility = await findById(req.params.id);
    // if (facility) {
    //   await facility.deleteOne();
    //   res.redirect("/facilities");
    // }
    facility = await findById(req.params.id);
    await remove(req.params.id);
    res.redirect("/facilities");
  } catch {
    if (facility != null) {
      req.flash("error", "Cannot remove facility");
      res.render("facilities/show", {
        data: facility,
        user: new User(req.user).toJSON(),
        // messages: "Could not remove facility",
      });
    } else {
      res.redirect("/");
    }
  }
};
