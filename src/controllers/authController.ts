import { NextFunction, Request, Response } from "express";

import RefreshToken from "../models/refreshToken";
import User, { IUser } from "../models/user";

import Facility from "../models/facility";
import { ApplicationError } from "../utils/errors";
import {
  comparePassword,
  issueAccessToken,
  issueRefreshToken,
} from "../utils/helpers";

export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("refreshToken", { httpOnly: true, path: "/" });
  res.status(200).json({ message: "Logged out successfully" });
};

export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, facility, name, password } = req.body as Partial<IUser>;
  // check email is not used
  if (await User.findOne({ email })) {
    next(
      new ApplicationError(
        400,
        "An user with that email is already registered",
      ),
    );
    return;
  }
  // check facility exists, if not throw error
  // if (!(await Facility.findById({ _id: facility }))) {
  //   next(new ApplicationError(400, "Facility does not exist"));
  //   return;
  // }

  // const result = await Facility.findOne({ _id: facility }).select("_id").lean();
  // if (!result) {
  //   // facility not exists...
  //   next(new ApplicationError(400, "Facility does not exist"));
  //   return;
  // }
  try {
    if (!(await Facility.exists({ _id: facility }))) {
      next(new ApplicationError(400, "Facility does not exist"));
      return;
    }
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(400, err.message));
      return;
    } else {
      next(new ApplicationError(400, "Invalid facility ObjectId"));
      return;
    }
  }
  // Facility.exists({ _id: facility }, function (err) {
  //   if (err) {
  //     next(new ApplicationError(400, "Facility does not exist"));
  //     return;
  //   } else {
  //     console.log("Does the user exist?", exists); // true or false
  //   }
  // });
  try {
    const user: IUser = await User.create({ email, facility, name, password });
    res.status(201).json({ data: { user } });
  } catch (err) {
    if (err instanceof Error) {
      next(new ApplicationError(500, err.message));
    } else {
      next(new ApplicationError(500, "Cannot register user"));
    }
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, password } = req.body as Partial<IUser>;
  if (!email) {
    next(new ApplicationError(401, "Missing Email"));
    return;
  }
  if (!password) {
    next(new ApplicationError(401, "Missing Password"));
    return;
  }

  const user = await User.findOne({ email });
  if (!user) {
    next(new ApplicationError(401, "Invalid email"));
    return;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    next(new ApplicationError(401, "Invalid Password"));
    return;
  }
  const payload = {
    email: user.email,
    facility: user.facility?._id.toString(),
    id: user._id.toString(),
    role: user.role,
  };
  const accessToken = issueAccessToken(payload);
  const refreshToken = issueRefreshToken({ id: user._id.toString() });
  // save the refresh token with current user
  try {
    const rT = await RefreshToken.create({
      token: refreshToken,
      user: user._id,
    });

    res.cookie("refreshToken", rT.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      // signed: true,
    });

    res.status(200).json({
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      // res.status(400).json({ error: err.message });
      next(new ApplicationError(500, err.message));
      // throw new ApplicationError(500, err.message);
    } else {
      next(new ApplicationError(500, "Login failed"));
    }
  }
}

export async function whoami(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    const user = await User.findOne({ email: (req.user as IUser).email });
    // res.status(200).json({ data: { user: new User(req.user).toJSON() } });
    res.status(200).json({ data: { user } });
  } else {
    next(new ApplicationError(401, "Unauthorized"));
  }
}
