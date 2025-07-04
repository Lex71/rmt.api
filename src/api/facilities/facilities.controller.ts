import { NextFunction, Request, Response } from "express";

import {
  /* Facility, */ FacilitySearchOptionsType,
  IFacility,
} from "../../models/facility";
// import User from "../../models/user";
import { ApplicationError } from "../../utils/errors";
import * as FacilityService from "./facilities.service";

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
    res.status(200).json({ data: facilities });
  } catch {
    next(new ApplicationError(500, "Cannot getAll facilities"));
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let facility = null;
  try {
    facility = await FacilityService.findById(req.params.id);
    res.status(200).json({ data: facility });
  } catch (err) {
    if (facility == null) {
      if (err instanceof Error) {
        next(new ApplicationError(404, err.message));
      } else {
        next(new ApplicationError(404, "Facility non exists"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot update facility"));
      }
    }
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { address, name } = req.body as IFacility;
  try {
    // const newFacility = await FacilityService.create(facility);
    const newFacility = await FacilityService.create({ address, name });
    res.status(201).json({ data: newFacility });
  } catch {
    next(new ApplicationError(500, "Error creating Facility"));
  }
};

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

    res.status(200).json({ data: facility });
  } catch (err: unknown) {
    if (facility == null) {
      if (err instanceof Error) {
        next(new ApplicationError(404, err.message));
      } else {
        next(new ApplicationError(404, "Facility non exists"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot update facility"));
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
    const body = req.body as Partial<IFacility>;
    table = await FacilityService.update(req.params.id, body);
    res.status(200).json({ data: table });
  } catch (err: unknown) {
    if (table == null) {
      next(new ApplicationError(404, "Facility non exists"));
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot update facility"));
      }
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
    facility = await FacilityService.findById(req.params.id);
    await FacilityService.remove(req.params.id);
    res.status(200).json({ data: facility });
    // or send status 204 and empty data
  } catch (err: unknown) {
    if (facility != null) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot remove facility"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(404, err.message));
      } else {
        next(new ApplicationError(404, "Facility non exists"));
      }
    }
  }
};
