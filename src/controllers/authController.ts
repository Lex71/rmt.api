import { NextFunction, Request, Response } from "express";

import RefreshToken from "../models/refreshToken.ts";
import User, { IUser } from "../models/user";

import { ApplicationError } from "../utils/errors.ts";
import {
  comparePassword,
  issueAccessToken,
  issueRefreshToken,
} from "../utils/helpers.ts";
// enable these for jwt auth
// const helper = require("../utils/helper");

/* export const newLogin = (_req: Request, res: Response) => {
  res.render("auth/login", {
    layout: "layouts/auth",
    // data: { user: new User() },
  });
};

export const newRegister = async (req: Request, res: Response) => {
  try {
    const facilities = await find();
    if (facilities.length === 0) {
      req.flash("error", "Cannot register: no facilities available");
      res.redirect("/auth/login");
    } else {
      res.render("auth/new", {
        data: { facilities },
        layout: "layouts/auth",
      });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      req.flash("error", err.message);
    } else {
      req.flash("error", "Cannot register user");
    }
    res.redirect("/");
  }
};

// session / cookie auth
export const passportLogin = (): RequestHandler => {
  return passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/auth/login",
    successRedirect: "/",
  }) as RequestHandler;
};

export const registerUser = async (
  req: Request,
  res: Response,
  // next: NextFunction,
) => {
  try {
    const body = req.body as Partial<IUser>;
    // check email is not used
    if (await User.findOne({ email: body.email })) {
      throw new Error("An user with that email is already registered");
    }
    // const hashedPassword = await hashPassword(req.body.password);
    const user = new User({
      email: body.email,
      facility: body.facility, // the ._id of the facility model
      name: body.name,
      // password: hashedPassword, // the Model has a pre hook to hash the password
      password: body.password,
    });
    await user.save();
    res.redirect("/auth/login");
  } catch (err: unknown) {
    // next(err);
    // console.log(err)
    if (err instanceof Error) {
      req.flash("error", err.message);
    } else {
      req.flash("error", "Cannot register user");
    }
    // load fresh form...
    res.redirect("/auth/new");
    // OR if you want to keep (wrong) inputs:
    // res.render("auth/new", { data: { user: { ...req.body } } });
  }
}; */

/* export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  req.logOut((err) => {
    if (err) {
      next(err);
      return;
    }
    res.redirect("/");
  });
  // req.logOut(function (err) {
  //   if (err) {
  //     next(err);
  //     return;
  //   }
  //   res.redirect("/auth/login");
  // });
}; */

export const logoutUser = (req: Request, res: Response) => {
  // const invalidToken = "invalidToken";
  res.clearCookie("refreshToken", { httpOnly: true, path: "/" });
  // res.cookie("refreshToken", invalidToken, {
  //   httpOnly: true,
  //   sameSite: true,
  //   secure: true,
  //   signed: true,
  // });
  // res.cookie("accessToken", invalidToken, {
  //   httpOnly: true,
  //   sameSite: true,
  //   secure: true,
  //   // signed: true,
  // });
  res.status(200).json({ message: "Logged out successfully" });
};

// JWT

// TODO: use these for passport-jwt strategy, to authenticate endpoints using a JSON web token.
// It is intended to be used to secure RESTful endpoints without sessions.
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, facility, name, password } = req.body as Partial<IUser>;
  // const passwordHash = await helper.hashPassword(password);
  // check email is not used
  if (await User.findOne({ email })) {
    next(
      new ApplicationError(
        400,
        "An user with that email is already registered",
      ),
    );
    return;
    // throw new Error("An user with that email is already registered");
  }
  // const user = await User.create({
  //   email,
  //   name,
  //   password,
  // });
  // const user: IUser = new User({
  //   email,
  //   facility, // the ._id of the facility model
  //   name,
  //   // password: hashedPassword, // the Model has a pre hook to hash the password
  //   password,
  // });
  try {
    /* await user.save(); */
    const user: IUser = await User.create({ email, facility, name, password });
    res.status(201).json({ data: { user } }); // return res.status(201).json(user);
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
  // const rT = new RefreshToken({
  //   token: refreshToken,
  //   user: user._id,
  // });
  try {
    // await rT.save();
    const rT = await RefreshToken.create({
      token: refreshToken,
      user: user._id,
    });
    // { httpOnly: true, sameSite: "strict", secure: true, signed: true }
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: true,
    // });
    res.cookie("refreshToken", rT.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      // signed: true,
    });
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true, // Ensures the cookie is not accessible via JavaScript
    //   maxAge: 24 * 60 * 60 * 1000, // Token expires in 24 hours
    //   sameSite: "strict", // Helps prevent CSRF attacks
    //   secure: true, // Ensures the cookie is only sent over HTTPS (set to false for development)
    // });
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

/* export async function refreshToken(req: Request, res: Response) {
  // const { refreshToken: refreshTokenUUID } = req.body;

  // const refreshToken = await RefreshToken.findOne({
  //   token: refreshTokenUUID,
  // }).populate("user");

  if (!refreshToken) {
    return res.status(404).json({ error: "invalid refresh token" });
  }

  const isExpired = !helper.verifyRefreshTokenNotExpired(refreshToken);

  if (isExpired) {
    await RefreshToken.findByIdAndDelete(refreshToken._id).exec();
    return res.status(403).json({ error: "Refresh token is expired" });
  }

  const payload = {
    email: refreshToken.user.email,
    id: refreshToken.user.id,
  };
  await RefreshToken.findByIdAndDelete(refreshToken._id).exec();

  const newAccessToken = helper.issueAccessToken(payload);
  const newRefreshToken = await helper.createRefreshToken(payload.id);

  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
} */

export async function whoami(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    const user = await User.findOne({ email: (req.user as IUser).email });
    // res.status(200).json({ data: { user: new User(req.user).toJSON() } });
    res.status(200).json({ data: { user } });
  } else {
    next(new ApplicationError(401, "Unauthorized"));
    // throw new ApplicationError(401, "Unauthorized");
  }
}
