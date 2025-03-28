import { comparePassword, hashPassword } from "../utils/helpers";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
import {
  Document,
  HydratedDocument,
  Model,
  model,
  Schema,
  Types,
} from "mongoose";

enum Role {
  ADMIN = "admin",
  USER = "user",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  // roles: Role[];
  facility?: Types.ObjectId;
  // tokens: { token: string }[];
}

export interface IUserMethods {
  // generateAuthToken(): Promise<string>;
  toJSON(): IUser;
}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByCredentials(
    email: string,
    password: string,
  ): Promise<HydratedDocument<IUser, IUserMethods>>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>({
  name: { type: String, trim: true, required: true },
  email: { type: String, trim: true, unique: true, required: true },
  password: { type: String, required: true },
  // tokens: [{ token: { type: String, required: true } }],
});

userSchema.add({
  // single string
  role: { type: String, enum: Object.values(Role), default: Role.USER },
  // array of strings
  // roles: [{ type: String, enum: Object.values(Role), default: Role.USER }],
});

userSchema.add({
  facility: { type: Schema.Types.ObjectId, ref: "Facility" },
});

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

userSchema.methods.toJSON = function () {
  const user = this as IUser;
  const userObject = user.toObject();
  delete userObject.password;
  // delete userObject.tokens;
  return userObject;
};

userSchema.statics.findByCredentials = async (email, password) => {
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
