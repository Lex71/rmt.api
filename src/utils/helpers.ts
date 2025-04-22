import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/config.ts";
import { Role } from "../models/user.ts";

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
  const decodedToken = jwt.decode(token, { complete: true })
    ?.payload as JwtPayload;
  if (decodedToken.exp) {
    const expirationDate = new Date(decodedToken.exp * 1000);
    console.log(expirationDate);
    return expirationDate.getTime() > new Date().getTime();
  }
  return false;
}

const issueAccessToken = (payload: {
  email: string;
  id: string;
  role: Role;
}) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "1m" });
};

const issueRefreshToken = (payload: { id: string }) => {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: "7d" });
};

export {
  comparePassword,
  hashPassword,
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshTokenNotExpired,
};
