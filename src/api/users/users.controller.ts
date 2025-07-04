import { NextFunction, Request, Response } from "express";

import { IUser, UserSearchOptionsType } from "../../models/user";
import { ApplicationError } from "../../utils/errors";
import * as UserService from "../users/users.service";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // handle req.query
  const searchOptions: UserSearchOptionsType = {};

  searchOptions.query = {};
  // search by name
  if (req.query.name != null && req.query.name !== "") {
    searchOptions.query.name = req.query.name as string;
  }
  // search by email
  if (req.query.email != null && req.query.email !== "") {
    searchOptions.query.email = req.query.email as string;
  }
  // search by role
  if (req.query.role != null && req.query.role !== "") {
    searchOptions.query.role = req.query.role as string;
  }
  // search by facility
  if (req.query.facility != null && req.query.facility !== "") {
    searchOptions.query.facility = req.query.facility as string;
  }

  let user = [];
  try {
    user = await UserService.find(searchOptions);
    // res.render("user/index", {
    //   data: user,
    //   searchOptions: { ...req.query },
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: user });
  } catch {
    // res.redirect("/");
    next(new ApplicationError(500, "Cannot getAll users"));
  }
};

export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await UserService.findById(req.params.id);
    // res.render("user/show", {
    //   data: user,
    //   user: new User(req.user).toJSON(),
    // });
    res.status(200).json({ data: user });
  } catch {
    // res.redirect("/");
    next(new ApplicationError(500, "User not found"));
  }
};

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, facility, name, password, role } = req.body as IUser;

  try {
    const newUser = await UserService.create({
      email,
      facility,
      name,
      password,
      role,
    }); //.catch(() => { throw new Error("Cannot create user"); });
    // res.redirect(`user/${newTable._id.toString()}`);
    res.status(201).json({ data: newUser });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Error creating User"));
    }
  }
};

/* export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user = null;
  // cannot change facility!
  const { name, role } = req.body as IUser;
  try {
    user = await UserService.update(req.params.id, {
      name,
      role,
    });

    res.status(200).json({ data: user });
  } catch (err: unknown) {
    if (user !== null) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot update user"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "User non exists"));
      }
    }
  }
}; */

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user = null;
  try {
    user = await UserService.findById(req.params.id);
    await UserService.remove(req.params.id);
    res.status(200).json({ data: user });
  } catch (err: unknown) {
    if (user != null) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot remove user"));
      }
    } else {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "User non exists"));
      }
    }
  }
};
