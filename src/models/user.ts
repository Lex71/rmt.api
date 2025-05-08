// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import {
  // Document,
  HydratedDocument,
  Model,
  model,
  QueryOptions,
  Schema,
  Types,
} from "mongoose";

import { comparePassword, hashPassword } from "../utils/helpers";

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser /* extends Document */ {
  email: string;
  // roles: Role[];
  role: Role;
  name: string;
  password: string;
  facility?: Types.ObjectId;
}

interface IUserMethods {
  // generateAuthToken(): Promise<string>;
  toJSON(): Partial<IUser>;
}

export interface UserSearchOptionsType {
  // query?: Partial<QueryOptions<IFacility>>; // Optional search query, all searchable fields except _id
  // query?: Partial<QueryOptions<IQueryFacility>>; // Optional search query, all searchable fields except _id
  page?: number; // Optional page number for pagination
  sortBy?: string; // Optional field to sort by
  pageSize?: number; // Optional page size for pagination
  sortOrder?: "asc" | "desc"; // Optional sort order, ascending or descending
  query?: Partial<Omit<QueryOptions<IUser>, "_id">>; // Optional search query, all searchable fields except _id
}

interface UserModel extends Model<IUser, object, IUserMethods> {
  findByCredentials(
    email: string,
    password: string,
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { required: true, trim: true, type: String, unique: true },
    facility: { ref: "Facility", type: Schema.Types.ObjectId },
    name: { required: true, trim: true, type: String },
    password: { required: true, type: String },
    role: { default: Role.USER, enum: Object.values(Role), type: String },
  },
  { timestamps: true },
);

/* userSchema.add({
  // single string
  role: { default: Role.USER, enum: Object.values(Role), type: String },
  // array of strings
  // roles: [{ type: String, enum: Object.values(Role), default: Role.USER }],
}); */

/* userSchema.add({
  facility: { ref: "Facility", type: Schema.Types.ObjectId },
}); */

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
  next();
});

// userSchema.methods.generateAuthToken = async function () {
//   const user = this;
//   const token = jwt.sign(
//     // { _id: user._id.toString() }, // REVIEW ts error 'user._id' is of type 'unknown'
//     { _id: (user._id as unknown as Types.ObjectId).toString() },
//     process.env.JWT_KEY as string,
//   );
//   user.tokens = user.tokens.concat({ token });
//   await user.save();
//   return token;
// };

userSchema.methods.toJSON = function (): Partial<IUser> {
  // const user = this as IUser;
  const user = this as HydratedDocument<IUser> & IUser;
  // const userObject = user.toObject();
  const userObject: Partial<IUser> = user.toObject();
  delete userObject.password;
  // delete userObject.tokens;
  return userObject;
};

userSchema.statics.findByCredentials = async (
  email: string,
  password: string,
) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return null;
  }
  return user;
};

const User = model<IUser, UserModel>("User", userSchema);

export default User;
