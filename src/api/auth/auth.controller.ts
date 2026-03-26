import { NextFunction, Request, Response } from "express";

import RefreshToken from "../../models/refreshToken";
import User, { type IUser } from "../../models/user";
import { findByEmail } from "../users/users.service"; // import findByEmail from "../users/users.service";

import Facility from "../../models/facility";
import { ApplicationError } from "../../utils/errors";
import {
  comparePassword,
  issueAccessToken,
  issueRefreshToken,
} from "../../utils/helpers";

export const logoutUser = (req: Request, res: Response) => {
  res.clearCookie("refreshToken", { httpOnly: true, path: "/" });
  // res.status(200).json({ message: "Logged out successfully" });
  // res.status(200).json({ data: req.user });
  res.status(200).json({ message: "Logged out successfully" });
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, facility, name, password, passwordConfirm } =
    req.body as Partial<IUser> & {
      passwordConfirm: string;
    };
  // check email is not used
  // if (await User.findOne({ email })) {
  if (!email) {
    next(new ApplicationError(400, "Missing email"));
    return;
  }
  const found = await findByEmail(email);
  if (found) {
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

  // password and confirm password do not match
  if (password !== passwordConfirm) {
    next(new ApplicationError(400, "Passwords do not match"));
    return;
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
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body as Partial<IUser>;
  if (!email) {
    next(new ApplicationError(400, "Missing Email"));
    return;
  }
  if (!password) {
    next(new ApplicationError(400, "Missing Password"));
    return;
  }

  const user = await findByEmail(email);
  if (!user) {
    next(new ApplicationError(401, "Invalid Email"));
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
      user: user._id.toString(),
    });

    res.cookie("refreshToken", rT.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: false,
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
};
export const whoami = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user) {
    const user = await User.findOne({ email: (req.user as IUser).email });
    // res.status(200).json({ data: { user: new User(req.user).toJSON() } });
    res.status(200).json({ data: { user } });
  } else {
    next(new ApplicationError(401, "Unauthorized"));
  }
};

// export async function changePassword(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   const { currentPassword, email, newPassword } = req.body as {
//     email: string;
//     currentPassword: string;
//     newPassword: string;
//   };
//   // TODO: replace with findByEmail, and update also the test
//   // if (!(await User.findOne({ email }))) {
//   //   next(new ApplicationError(400, "An user with that email not exists"));
//   //   return;
//   // }
//   const user = await findByEmail(email);
//   if (!user) {
//     next(new ApplicationError(401, "Invalid Email"));
//     return;
//   }

//   if (req.user && req.user.email.toLowerCase() !== email.toLowerCase()) {
//     next(
//       new ApplicationError(400, "The email is not the same as the user email"),
//     );
//     return;
//   }

//   // const oldUser = await User.findOne({ email: email });

//   // if (!oldUser) {
//   //   next(new ApplicationError(400, "User does not exist"));
//   //   return;
//   // }
//   //return res.status(401).send("User does not exist");
//   const isMatch = await comparePassword(currentPassword, user.password);

//   if (!isMatch) {
//     // return res.status(401).send("Invalid old password");
//     next(new ApplicationError(401, "Invalid Current Password"));
//     return;
//   }

//   if (currentPassword === newPassword) {
//     next(
//       new ApplicationError(
//         400,
//         "Current and New passwords cannot be the same. Please choose a different password",
//       ),
//     );
//     return;
//   }

//   // user.password = newPassword;
//   try {
//     // const newUser: IUser = await user.save();
//     // res.status(200).json({ data: newUser });
//     await User.updateOne({ email: email }, { password: newPassword });

//     // const u = await User.findOne({ email: email });
//     res.status(200).json({ data: user });
//   } catch (err: unknown) {
//     if (err instanceof Error) {
//       // res.status(400).json({ error: err.message });
//       next(new ApplicationError(500, err.message));
//       // throw new ApplicationError(500, err.message);
//     } else {
//       next(new ApplicationError(500, "Change Password failed"));
//     }
//     return;
//   }
// }

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { currentPassword, email, newPassword } = req.body as {
    email: string;
    currentPassword: string;
    newPassword: string;
  };
  // TODO: replace with findByEmail, and update also the test
  // if (!(await User.findOne({ email }))) {
  //   next(new ApplicationError(400, "An user with that email not exists"));
  //   return;
  // }
  // const user = await findByEmail(email);

  // I need the object returned by User.findOne, so I can call .save()...
  const re = new RegExp(email, "i");
  const user = await User.findOne({ email: { $regex: re } });

  if (!user) {
    next(new ApplicationError(401, "Invalid Email"));
    return;
  }

  if (req.user && req.user.email.toLowerCase() !== email.toLowerCase()) {
    next(
      new ApplicationError(400, "The email is not the same as the user email"),
    );
    return;
  }

  // const oldUser = await User.findOne({ email: email });

  // if (!oldUser) {
  //   next(new ApplicationError(400, "User does not exist"));
  //   return;
  // }
  // const isMatch = await comparePassword(currentPassword, oldUser.password);

  const isMatch = await comparePassword(currentPassword, user.password);

  if (!isMatch) {
    next(new ApplicationError(401, "Invalid Current Password"));
    return;
  }

  if (currentPassword === newPassword) {
    next(
      new ApplicationError(
        400,
        "Current and New passwords cannot be the same. Please choose a different password",
      ),
    );
    return;
  }

  try {
    // oldUser.password = newPassword;
    // await oldUser.save();
    user.password = newPassword;
    await user.save();
    res.status(200).json({ data: user });
  } catch (err: unknown) {
    if (err instanceof Error) {
      // res.status(400).json({ error: err.message });
      next(new ApplicationError(500, err.message));
      // throw new ApplicationError(500, err.message);
    } else {
      next(new ApplicationError(500, "Change Password failed"));
    }
    return;
  }
};
