// const users = [];

// import { HydratedDocument } from "mongoose";
import { FacilitySearchOptionsType } from "../models/facility";
// import User, { IUser } from "../models/user";
import User, { IUser } from "../models/user";
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
  } catch (err) {
    throw err;
  }
};

export const findById = async (id: string): Promise<IUser | null> => {
  try {
    // return await Facility.findById(id);
    return await User.findById(id);
  } catch (err) {
    throw new Error("Facility not found");
  }
};

export const findByEmail = async (email: string): Promise<IUser | null> => {
  try {
    return await User.findOne({ email });
  } catch (err) {
    throw new Error("User not found");
  }
};

export const create = async (user: Partial<IUser>) => {
  const { name, email, password } = user;
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
    const newUser = new User({ name, email, password });
    return await newUser.save();
  } catch (err) {
    throw new Error("Cannot create User");
  }
};

export const remove = async (id: string) => {
  try {
    return await User.deleteOne({ id });
  } catch (err) {
    throw new Error("Cannot deleteOne: User not found");
  }
};
