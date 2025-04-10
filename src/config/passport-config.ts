import { PassportStatic } from "passport";
import { IVerifyOptions, Strategy, VerifyFunction } from "passport-local";

import { IUser } from "../models/user";
import { comparePassword } from "../utils/helpers";
// const PassportJWT = require("passport-jwt");
const LocalStrategy = Strategy;

function initialize(
  passport: PassportStatic,
  getUserByEmail: (email: string) => Promise<IUser | null>,
  getUserById: (id: string) => Promise<IUser | null>,
) {
  const authenticateUser: VerifyFunction = (
    email: string,
    password: string,
    done: (
      error: unknown,
      user?: Express.User | false,
      options?: IVerifyOptions,
    ) => void, // (error, user, message)
  ): void => {
    getUserByEmail(email)
      .then((user) => {
        if (user == null) {
          done(null, false, { message: "No user with that email" });
          return;
        } else {
          comparePassword(password, user.password)
            .then((isMatch) => {
              if (isMatch) {
                done(null, user as unknown as Express.User);
                return;
              } else {
                done(null, false, { message: "Password incorrect" });
                return;
              }
            })
            .catch((e: unknown) => {
              done(e);
              return;
            });
        }
      })
      .catch((e: unknown) => {
        done(e);
        return;
      });

    // (async () => {
    //   const user = await getUserByEmail(email);
    //   if (user == null) {
    //     done(null, false, { message: "No user with that email" });
    //     return;
    //   }

    // if (await comparePassword(password, user.password)) {
    //   done(null, user as Express.User);
    //   return;
    // } else {
    //   done(null, false, { message: "Password incorrect" });
    //   return;
    // }

    // })()
    //   .then(() => {
    //     return;
    //   })
    //   .catch(() => {
    //     return;
    //   });
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  /* passport.deserializeUser(async (id, done) =>
    { done(null, await getUserById(id)); },
  ); */

  passport.deserializeUser((id: string, done) => {
    getUserById(id)
      .then((user) => {
        done(null, user as unknown as Express.User);
      })
      .catch((err: unknown) => {
        done(err);
      });
  });
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
