import { NextFunction, Request, Response } from "express";

import RefreshToken, { IRefreshToken } from "../models/refreshToken.ts";
import User, { IUser } from "../models/user.ts";

import { ApplicationError } from "../utils/errors.ts";
import {
  comparePassword,
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshTokenNotExpired,
} from "../utils/helpers.ts";
// enable these for jwt auth
// const RefreshToken = require("../models/RefreshToken");
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
  const invalidToken = "invalidToken";
  res.cookie("jwt", invalidToken, {
    httpOnly: true,
    sameSite: true,
    secure: true,
    signed: true,
  });
  res.json({ message: "Logged out successfully" });
};

// JWT

// TODO: use these for passport-jwt strategy, to authenticate endpoints using a JSON web token.
// It is intended to be used to secure RESTful endpoints without sessions.
export async function registerUser(req: Request, res: Response) {
  const { email, facility, name, password } = req.body as Partial<IUser>;
  // const passwordHash = await helper.hashPassword(password);
  // check email is not used
  if (await User.findOne({ email })) {
    throw new Error("An user with that email is already registered");
  }
  // const user = await User.create({
  //   email,
  //   name,
  //   password,
  // });
  const user = new User({
    email,
    facility, // the ._id of the facility model
    name,
    // password: hashedPassword, // the Model has a pre hook to hash the password
    password,
  });
  try {
    await user.save();
  } catch (err: unknown) {
    if (err instanceof Error) {
      // return res.status(400).json({ error: err.message });
      throw new ApplicationError(500, err.message);
    }
  }
  res.status(201).json(user);
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email, password } = req.body as Partial<IUser>;
  const user = await User.findOne({ email });
  if (!user) {
    // return res.status(401).json({ error: "Invalid Email" });
    next(new ApplicationError(401, "Invalid Email"));
    return;
  }
  if (!password) {
    // return res.status(401).json({ error: "Invalid Email" });
    next(new ApplicationError(401, "Invalid Password"));
    return;
  }
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    // res.status(401).json({ error: "Invalid Password" });
    // throw new ApplicationError(401, "Invalid Password");
    next(new ApplicationError(401, "Invalid Password"));
    return;
  }
  const payload = {
    email: user.email,
    id: user._id.toString(),
    role: user.role,
  };
  const accessToken = issueAccessToken(payload);
  const refreshToken = issueRefreshToken({ id: user._id.toString() });
  // save the refresh token with current user
  const rT = new RefreshToken({
    token: refreshToken,
    user: user._id,
  });
  try {
    await rT.save();
    // { httpOnly: true, sameSite: "strict", secure: true, signed: true }
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    res.status(200).json({
      accessToken,
      refreshToken,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      // res.status(400).json({ error: err.message });
      next(new ApplicationError(400, err.message));
      // throw new ApplicationError(500, err.message);
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

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { token: requestToken } = req.body as Partial<IRefreshToken>;
  if (requestToken == null) {
    next(new ApplicationError(403, "Refresh Token is required!"));
  }

  try {
    const rT = await RefreshToken.findOne({ token: requestToken }).populate(
      "user",
    );
    if (!rT) {
      next(new ApplicationError(403, "Invalid refresh token"));
    } else {
      if (!verifyRefreshTokenNotExpired(rT.token)) {
        RefreshToken.deleteOne({ user: rT.user });
        next(
          new ApplicationError(
            403,
            "Refresh token was expired. Please make a new sign in request",
          ),
        );
      }

      // const user = await User.findOne({
      //   attributes: {
      //     exclude: ["password"],
      //   },
      //   where: { id: rT.user },
      // });
      const user = await User.findById(rT.user);

      if (!user) {
        next(new ApplicationError(500, "User not found"));
      } else {
        const payload = {
          email: user.email,
          id: user._id.toString(),
          role: user.role,
        };

        const newAccessToken = issueAccessToken(payload);

        res.status(200).json({
          accessToken: newAccessToken,
          // refreshToken: refreshToken.token,
        });
      }
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send("Internal server error");
  }
}

export function whoami(req: Request, res: Response) {
  return res.status(200).json(req.user);
}
