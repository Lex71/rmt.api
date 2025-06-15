/*** Documentation:

 * To make this token a one-time-use token, I encourage you to
 * use the user’s current password hash in conjunction with
 * the user’s created date (in ticks) as the secret key to
 * generate the JWT. This helps to ensure that if the user’s
 * password was the target of a previous attack (on an unrelated website),
 * then the user’s created date will make the secret key unique
 * from the potentially leaked password.

 * With the combination of the user’s password hash and created date,
 * the JWT will become a one-time-use token, because once the user
 * has changed their password, it will generate a new password hash
 * invalidating the secret key that references the old password
 * Reference: https://www.smashingmagazine.com/2017/11/safe-password-resets-with-json-web-tokens/
 **/
import { NextFunction, Request, Response } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../models/user";
import {
  getPasswordResetURL,
  resetPasswordTemplate,
  transporter,
} from "../modules/email";
import { ApplicationError } from "../utils/errors";
import { verifyRefreshTokenNotExpired } from "../utils/helpers";

// `secret` is passwordHash concatenated with user's createdAt,
// so if someones gets a user token they still need a timestamp to intercept.
export const usePasswordHashToMakeToken = ({
  _id: userId,
  password: passwordHash,
}: Partial<IUser>) => {
  if (passwordHash) {
    const secret = passwordHash;
    const token = jwt.sign({ userId }, secret, {
      expiresIn: 3600, // 1 hour
    });
    return token;
  }
  return;
};

/*** Calling this function with a registered user's email sends an email IRL ***/
/*** I think Nodemail has a free service specifically designed for mocking   ***/
export const sendPasswordResetEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body as { email: string };
  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    // res.status(404).json("No user with that email");
    if (err instanceof Error) {
      next(new ApplicationError(400, err.message));
      return;
    } else {
      next(new ApplicationError(404, "No user with that email"));
      return;
    }
  }
  if (!user) {
    next(new ApplicationError(404, "No user with that email"));
    return;
  }
  const token = usePasswordHashToMakeToken(user);
  if (!token) {
    next(new ApplicationError(500, "Cannot create reset password token"));
    return;
  }
  const url = getPasswordResetURL(user, token);
  console.log(url);
  const emailTemplate = resetPasswordTemplate(user, url);

  const sendEmail = () => {
    transporter.sendMail(emailTemplate, (err, info) => {
      if (err) {
        res.status(500).json({ message: "Error sending email" });
        return;
      }
      console.log(`** Email sent **`, info.response);
      res.status(202).json({ message: "Email sent" });
    });
  };
  sendEmail();
  // DEBUG
  // res.status(202).json({ message: "Email sent" });
};

export const setNewPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token, userId } = req.params;
  const { password } = req.body as { password: string };

  const user = await User.findOne({ _id: userId });

  if (!user) {
    next(new ApplicationError(404, "User not found"));
    return;
  }

  if (verifyRefreshTokenNotExpired(token)) {
    next(new ApplicationError(400, "1 Hour Token expired"));
    return;
  }

  const secret = user.password; /*  + "-" + user.createdAt; */
  // const payload = jwt.decode(token, secret);
  // const payload = jwt.decode(token, { complete: true })
  if (!jwt.verify(token, secret)) {
    next(new ApplicationError(400, "Invalid token"));
    return;
  }
  const payload = jwt.decode(token, { complete: true })?.payload as JwtPayload;

  if (payload.userId === user.id) {
    // await User.findOneAndUpdate({ _id: userId }, {password});
    user.password = password;
    try {
      await user.save();
      res.status(200).json({ message: "Password changed successfully" });
    } catch (err) {
      if (err instanceof Error) {
        next(new ApplicationError(500, err.message));
      } else {
        next(new ApplicationError(500, "Cannot change password for user"));
      }
    }

    /* bcrypt.genSalt(10, function (err, salt) {
          if (err) return;
          bcrypt.hash(password, salt, function (err, hash) {
            if (err) return;
            User.findOneAndUpdate({ _id: userId }, { password: hash })
              .then(() => res.status(202).json("Password changed accepted"))
              .catch((err) => res.status(500).json(err));
          });
        }); */
  } else {
    next(new ApplicationError(400, "Invalid userId in token"));
  }
};

export const validatePasswordResetToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token, userId } = req.params;

  const user = await User.findOne({ _id: userId });
  if (!user) {
    next(new ApplicationError(404, "User not found"));
    return;
  }

  if (verifyRefreshTokenNotExpired(token)) {
    next(new ApplicationError(400, "1 Hour Token expired"));
    return;
  }

  const secret = user.password; /*  + "-" + user.createdAt; */
  // const payload = jwt.decode(token, secret);
  // const payload = jwt.decode(token, { complete: true })
  if (!jwt.verify(token, secret)) {
    next(new ApplicationError(400, "Invalid token"));
    return;
  }
  res.status(200).json({ message: "Token valid" });
};
