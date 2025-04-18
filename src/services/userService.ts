// const users = [];

// import { HydratedDocument } from "mongoose";
import { FacilitySearchOptionsType } from "../models/facility.ts";
// import User, { IUser } from "../models/user.ts";
import User, { IUser } from "../models/user.ts";
// create,
//   find,
//   findById,
//   findByEmail,
//   remove,
//   update,

export const find = async (
  searchOptions: FacilitySearchOptionsType,
): Promise<IUser[]> => {
  // TODO crreate the corresponding type
  // return facilities;
  try {
    return await User.find(searchOptions);
  } catch {
    throw new Error("User not found");
  }
};

export const findById = async (id: string): Promise<IUser | null> => {
  try {
    // return await Facility.findById(id);
    return await User.findById(id);
  } catch {
    throw new Error("User not found");
  }
};

export const findByEmail = async (email: string): Promise<IUser | null> => {
  try {
    return await User.findOne({ email });
  } catch {
    throw new Error("User not found");
  }
};

export const create = async (user: Partial<IUser>) => {
  const { email, name, password } = user;
  if (!name || !email || !password) {
    return {
      error: "Please provide all the required fields",
    };
  }
  const existingUser = await findByEmail(email);
  if (existingUser) {
    return {
      error: "User with that email already exists.",
    };
  }

  // const { name, email, password } = body;

  // const user: HydratedDocument<IUser> = new User({

  try {
    const newUser = new User({ email, name, password });
    return await newUser.save();
  } catch {
    throw new Error("Cannot create User");
  }
};

export const remove = async (id: string) => {
  try {
    return await User.deleteOne({ _id: id });
  } catch {
    throw new Error("Cannot deleteOne: User not found");
  }
};
