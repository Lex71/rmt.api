import { PassportStatic } from "passport";
import User from "../models/user";

// const LocalStrategy = require("passport-local").Strategy;
// import bcrypt from "bcrypt";
// import { HydratedDocument } from "mongoose";
import { Strategy, VerifyFunction } from "passport-local";
import { comparePassword } from "../utils/helpers";
// const PassportJWT = require("passport-jwt");
const LocalStrategy = Strategy;

function initialize(
  passport: PassportStatic,
  getUserByEmail: Function,
  getUserById: Function,
) {
  const authenticateUser: VerifyFunction = async (
    email: string,
    password: string,
    done, // (error, user, message)
  ) => {
    const user = await getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }

    try {
      if (await comparePassword(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) =>
    done(null, await getUserById(id)),
  );
  // passport.deserializeUser(async (id, done) => {
  //   console.log("DESERIALIZING....");
  //   console.log(`id: ${id}`);
  //   const user = await getUserById(id);
  //   console.log(user);
  //   return done(null, user);
  // });
}

/* // TODO use this for passport-jwt strategy
const options = {
  jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.SESSION_SECRET,
};

function initialize(
  passport: PassportStatic,
  getUserById: Function,
) {
  const authenticateUser = async (payload: any, done: Function) => {
    try {
      const user = getUserById(payload.id); // await User.findOne({ _id: payload.id });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error);
    }
  }
  passport.use(
    new PassportJWT.Strategy(options, authenticateUser),
  );
} */

export default initialize;
