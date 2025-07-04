import { NextFunction, Request, Response } from "express";

import RefreshToken from "../../models/refreshToken";
import User, { IUser } from "../../models/user";

import { ApplicationError } from "../../utils/errors";
import {
  issueAccessToken,
  verifyRefreshTokenNotExpired,
} from "../../utils/helpers";

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let requestToken: string | null = null;
  if (req.signedCookies.refreshToken) {
    // Destructuring refreshToken from cookie
    requestToken = req.signedCookies.refreshToken as string;
  } else if (req.cookies.refreshToken) {
    requestToken = req.cookies.refreshToken as string;
  }

  if (!requestToken) {
    next(new ApplicationError(403, "Refresh Token is required!"));
    // next(new ApplicationError(403, "Refresh Token is required!"));
    return;
  }

  // if (!verifyRefreshTokenNotExpired(requestToken)) {
  // next(
  //   new ApplicationError(
  //     403,
  //     "Refresh token was expired. Please make a new sign in request",
  //   ),
  // );
  //   return;
  // }

  try {
    const rT = await RefreshToken.findOne({ token: requestToken }).populate(
      "user",
    );
    if (!rT) {
      next(new ApplicationError(403, "Invalid refresh token"));
      return;
    } else {
      if (!verifyRefreshTokenNotExpired(rT.token)) {
        // it is expired
        await RefreshToken.deleteOne({ user: rT.user });
        // res.clearCookie("refreshToken", { httpOnly: true, path: "/" });
        next(
          new ApplicationError(
            401,
            "Refresh token is expired. Please make a new sign in request",
          ),
        );
        return;
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
        return;
      } else {
        const payload = {
          email: user.email,
          facility: user.facility?._id.toString(),
          id: user._id.toString(),
          role: user.role,
        };

        const newAccessToken = issueAccessToken(payload);

        res.status(201).json({
          data: {
            accessToken: newAccessToken,
            // refreshToken: refreshToken.token,
          },
        });
      }
    }
  } catch (err) {
    console.log("err", err);
    res.status(500).send("Internal server error");
  }
}

export async function revokeRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { email } = req.body as Partial<IUser>;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      next(new ApplicationError(403, "User not found"));
      return;
    }
    await RefreshToken.deleteOne({ user: user._id.toString() });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
    });
    // const invalidToken = "invalidToken";
    // res.cookie("refreshToken", invalidToken, {
    //   httpOnly: true,
    //   sameSite: true,
    //   secure: true,
    //   signed: true,
    // });
    // res.status(204).json({ message: "Refresh token revoked successfully" });
    res.status(204).json({ data: user });
  } catch {
    next(new ApplicationError(500, "Revoke refresh token failed"));
    return;
  }
  // const user = req.user as User
  // if (req.cookies.refreshToken) {
  //   // Destructuring refreshToken from cookie
  //   const requestToken: string = req.cookies.refreshToken as string;

  //   if (!requestToken) {
  //     next(new ApplicationError(401, "Unauthorized"));
  //   }

  //   try {
  //     const rT = await RefreshToken.findOne({ token: requestToken }).populate(
  //       "user",
  //     );
  //     if (!rT) {
  //       next(new ApplicationError(403, "Invalid refresh token"));
  //     } else {
  //       const user = await User.findById(rT.user);
  //       if (!user) {
  //         next(new ApplicationError(500, "User not found"));
  //       }
  //       // TODO: delete refresh token from db
  //       await RefreshToken.deleteOne({ user: rT.user });
  //       res.status(204).json({ message: "Refresh token revoked successfully" });
  //     }
  //   } catch (err) {
  //     console.log("err", err);
  //     next(new ApplicationError(500, "Revoke refresh token failed"));
  //   }
  // } else {
  //   next(new ApplicationError(403, "Refresh Token is required!"));
  // }
}
