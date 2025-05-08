import { Request } from "express";
import { PassportStatic } from "passport";
import {
  ExtractJwt,
  Strategy as JwtStrategy,
  VerifyCallback,
} from "passport-jwt";
import config from "../config/config";
import User, { IUser } from "../models/user";

const cookieExtractor = (req: Request) => {
  let token = null;
  console.log(`cookies: ${JSON.stringify(req.cookies.accessToken)}`);
  console.log(
    `signedCookies: ${JSON.stringify(req.signedCookies.accessToken)}`,
  );
  if (req.signedCookies.accessToken) {
    token = req.signedCookies.accessToken as string;
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken as string;
  }
  return token;
  // return req.cookies.accessToken as string;
};

const bearerExtractor = (req: Request) => {
  let token = null;
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }
  return token;
};

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([bearerExtractor, cookieExtractor]),
  secretOrKey: config.JWT_SECRET,
};

function initialize(
  passport: PassportStatic,
  getUserByEmail: (email: string) => Promise<IUser | null>,
) {
  const authenticateUser: VerifyCallback = (
    jwt_payload: { email: string; password: string }, // payload
    done: (error: unknown, user?: IUser | false, options?: unknown) => void, // (error, user, message)
  ) => {
    // email = 'test1@rmt.com'
    // exp = 1745072138
    // iat = 1745071238
    // id = '67eaee3d08d4dabed5ab1a0a'
    // role = 'user'
    console.log(`authenticateUser: ${JSON.stringify(jwt_payload)}`);
    getUserByEmail(jwt_payload.email)
      .then((user) => {
        if (user == null) {
          done(null, false, { message: "No user with that email" });
        } else {
          done(null, new User(user).toJSON());
        }
      })
      .catch((e: unknown) => {
        done(e);
      });
  };

  passport.use(new JwtStrategy(options, authenticateUser));
}

export default initialize;
