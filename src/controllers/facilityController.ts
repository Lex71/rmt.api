import { Request, Response } from "express";
import Facility, {
  FacilitySearchOptionsType,
  IFacility,
} from "../models/facility";
import {
  create,
  find,
  findById,
  remove,
  update,
} from "../services/facilityService";

export const getFacilities = async (req: Request, res: Response) => {
  // handle params.query
  let searchOptions: FacilitySearchOptionsType = {};
  if (req.query) {
    searchOptions.query = {};
    // search by name
    if (req.query.name != null && req.query.name !== "") {
      searchOptions.query.name = req.query.name.toString();
    }
    // search by address
    if (req.query.address != null && req.query.address !== "") {
      searchOptions.query.address = req.query.address.toString();
    }
  }

  try {
    const facilities = await find(searchOptions);
    res.render("facilities/index", {
      data: facilities,
      searchOptions: { ...req.query },
    });
  } catch {
    res.redirect("/");
  }
};

export const getFacility = async (req: Request, res: Response) => {
  try {
    const facility = await findById(req.params.id);
    res.render("facilities/show", {
      facility: facility,
    });
  } catch {
    res.redirect("/");
  }
};

export const createFacility = async (req: Request, res: Response) => {
  const facility = new Facility({
    name: req.body.name,
    address: req.body.address,
  });
  try {
    const newFacility: IFacility = await create(facility);
    res.redirect(`facilities/${newFacility._id}`);
  } catch {
    res.render("facilities/new", {
      facility: facility,
      messages: "Error creating Facility",
    });
    // req.flash("messages", "Cannot create facility");
    // throw new Error("Error creating Facility");
  }
};

export const editFacility = async (req: Request, res: Response) => {
  try {
    // const facility = await Facility.findById(req.params.id);
    const facility = await findById(req.params.id);
    res.render("facilities/edit", { facility: facility });
  } catch {
    res.redirect("/facilities");
  }
};

export const newFacility = (req: Request, res: Response) => {
  res.render("facilities/new", {
    data: { user: req.user, facility: new Facility() },
  });
};

export const updateFacility = async (req: Request, res: Response) => {
  let facility: IFacility | null = null;
  try {
    // facility = await fetchFacility(req.params.id);
    // facility = await findById(req.params.id);
    // if (facility) {
    //   facility.name = req.body.name;
    //   await facility.save();
    //   res.redirect(`/facilities/${facility.id}`);
    // }
    facility = await update(req.params.id, req.body);
    facility ? res.redirect(`/facilities/${facility.id}`) : res.redirect("/");
  } catch {
    if (facility == null) {
      res.redirect("/");
    } else {
      res.render("facilities/edit", {
        facility: facility,
        messages: "Error updating Facility",
      });
    }
  }
};

export const removeFacility = async (req: Request, res: Response) => {
  let facility: IFacility | null = null;
  try {
    // facility = await findById(req.params.id);
    // if (facility) {
    //   await facility.deleteOne();
    //   res.redirect("/facilities");
    // }
    facility = await findById(req.params.id);
    if (facility == null) {
      res.redirect("/");
    }
    await remove(req.params.id);
    res.redirect("/facilities");
  } catch (err) {
    if (facility != null) {
      res.render("facilities/show", {
        facility: facility,
        messages: "Could not remove facility",
      });
    } else {
      res.redirect("/");
    }
  }
};
