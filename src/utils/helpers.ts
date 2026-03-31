import bcrypt from "bcrypt";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import moment from "moment";
import config from "../config/config";
import { Role } from "../models/user";

const saltRounds = 10;

async function comparePassword(
  password: string,
  hashPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);
  return passwordHash;
}

function verifyRefreshTokenNotExpired(token: string): boolean {
  let stillValid = false;
  const decodedToken = jwt.decode(token, { complete: true })
    ?.payload as JwtPayload;
  if (decodedToken.exp) {
    const expirationDate = new Date(decodedToken.exp * 1000);
    stillValid = expirationDate.getTime() > new Date().getTime();
  }
  return stillValid;
}

const issueAccessToken = (payload: {
  email: string;
  id: string;
  role: Role;
  facility?: string;
}): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.ACCESS_TOKEN_EXPIRATION,
  } as SignOptions);
};

const issueRefreshToken = (payload: { id: string }) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.REFRESH_TOKEN_EXPIRATION,
  } as SignOptions);
};

const timeOverlaps = (
  reservation_time: string,
  booking_time: string,
  adjust: number,
  delay: number,
): boolean => {
  try {
    const time = moment(reservation_time, "HH:mm");
    const b_time = moment(booking_time, "HH:mm").add(adjust, "minutes");
    // time conditions:
    // booking_time == time ||
    // booking_time == time+DELAY ||
    // booking_time < time && booking_time+DELAY >= time ||
    // booking_time > time && booking_time <= time+DELAY
    const condition1 = b_time.isSame(time);
    const condition2 = b_time.isSame(time.clone().add(delay, "minutes"));
    const condition3 =
      b_time.isBefore(time) &&
      b_time.clone().add(delay, "minutes").isSameOrAfter(time);
    const condition4 =
      b_time.isAfter(time) &&
      b_time.isSameOrBefore(time.clone().add(delay, "minutes"));
    // console.log(
    //   `condition1: ${condition1.toString()}, condition2: ${condition2.toString()}, condition3: ${condition3.toString()}, condition4: ${condition4.toString()}`,
    // );
    return condition1 || condition2 || condition3 || condition4;
  } catch (e) {
    console.log(e);
    // if there is an error with time parsing, return true so that the reservation cannot be made
    return true;
  }
};

export {
  comparePassword,
  hashPassword,
  issueAccessToken,
  issueRefreshToken,
  timeOverlaps,
  verifyRefreshTokenNotExpired,
};
