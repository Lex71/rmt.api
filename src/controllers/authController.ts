import { NextFunction, Request, Response } from "express";
import passport from "passport";
import User from "../models/user";
import { find as allFacilities } from "../services/facilityService";
// import { hashPassword } from "../utils/helpers";
// enable these for jwt auth
// const RefreshToken = require("../models/RefreshToken");
// const helper = require("../utils/helper");

export const newLogin = (_req: Request, res: Response) => {
  res.render("auth/login", {
    layout: "layouts/auth",
    // data: { user: new User() },
  });
};

export const newRegister = async (req: Request, res: Response) => {
  try {
    const facilities = await allFacilities();
    if (facilities.length === 0) {
      req.flash("error", "Cannot register: no facilities available");
      res.redirect("/auth/login");
    } else {
      res.render("auth/register", {
        layout: "layouts/auth",
        data: { facilities },
      });
    }
  } catch {
    req.flash("error", "Cannot fetch facilities");
    res.redirect("/");
  }
};

// session / cookie auth
export const passportLogin = () =>
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
  });

export const registerUser = async (
  req: Request,
  res: Response,
  // next: NextFunction,
) => {
  try {
    // check email is not used
    if (await User.findOne({ email: req.body.email })) {
      throw new Error("An user with that email is already registered");
    }
    // const hashedPassword = await hashPassword(req.body.password);
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      // password: hashedPassword, // the Model has a pre hook to has the password
      password: req.body.password,
      facility: req.body.facility,
    });
    await user.save();
    res.redirect("/auth/login");
  } catch (err: any) {
    // next(err);
    // console.log(err);
    req.flash("error", err.message);
    // load fresh form...
    res.redirect("/auth/register");
    // OR if you want to keep (wrong) inputs:
    // res.render("auth/register", { data: { user: { ...req.body } } });
  }
};

export const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
  // req.logOut(function (err) {
  //   if (err) {
  //     return next(err);
  //   }
  //   res.redirect("/auth/login");
  // });
};

// JWT

// TODO: use these for passport-jwt strategy, to authenticate endpoints using a JSON web token.
// It is intended to be used to secure RESTful endpoints without sessions.
/* async function registerUser(req: Request, res: Response) {
  const { name, email, password } = req.body;
  const passwordHash = await helper.hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: passwordHash,
  });

  return res.status(201).json(user);
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid Email" });
  }
  const isPasswordCorrect = helper.comparePassword(
    password,
    user.password,
  );
  if (!isPasswordCorrect) {
    return res.status(401).json({ error: "Invalid Password" });
  }
  const payload = {
    email: user.email,
    id: user.id,
  };
  const accessToken = helper.issueAccessToken(payload);
  const refreshToken = await helper.createRefreshToken(user.id);
  return res.status(200).json({
    accessToken,
    refreshToken,
  });
}

export async function refreshToken(req: Request, res: Response) {
  const { refreshToken: refreshTokenUUID } = req.body;

  const refreshToken = await RefreshToken.findOne({
    token: refreshTokenUUID,
  }).populate("user");

  if (!refreshToken) {
    return res.status(404).json({ error: "invalid refresh token" });
  }

  const isExpired = helper.verifyRefreshTokenExpiration(refreshToken);

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
}

export async function whoami(req: Request, res: Response) {
  return res.status(200).json(req.user);
} */
