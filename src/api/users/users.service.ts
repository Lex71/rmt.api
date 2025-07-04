import mongoose from "mongoose";
import RefreshToken from "../../models/refreshToken";
import User, { IUser, UserSearchOptionsType } from "../../models/user";

export const find = async (
  searchOptions: UserSearchOptionsType,
): Promise<IUser[]> => {
  // TODO crreate the corresponding type
  // return facilities;
  try {
    return await User.find(searchOptions);
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("User not found");
  }
};

export const findById = async (id: string): Promise<IUser | null> => {
  try {
    // return await Facility.findById(id);
    return await User.findById(id).orFail();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("User not found");
  }
};

export const findByEmail = async (email: string): Promise<IUser | null> => {
  try {
    return await User.findOne({ email });
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("User not found");
  }
};

export const create = async (user: Partial<IUser>) => {
  const { email, name, password } = user;
  if (!name || !email || !password) {
    // return {
    //   error: "Please provide all the required fields",
    // };
    throw new Error("Please provide all the required fields");
  }
  const existingUser = await findByEmail(email);
  if (existingUser) {
    // return {
    //   error: "User with that email already exists.",
    // };
    throw new Error("User with that email already exists.");
  }

  try {
    return await User.create({ email, name, password });
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot create User");
  }
};

export const remove = async (id: string) => {
  try {
    // return await User.deleteOne({ _id: id });
    await RefreshToken.deleteMany({ user: id });
    return await User.findByIdAndDelete(id);
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot deleteOne: User not found");
  }
};
