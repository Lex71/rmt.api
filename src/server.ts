import express, { Request, Response } from "express";
import { Types } from "mongoose";
// passport
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";

// OR use this for jwt authentication instead
// const passport = require("./middlewares/passport"); // if integration inside passport-config doesn't work
import config from "./config/config.ts";
// config
// NOTE: just skip it for jwt authentication
import initializePassport from "./config/passport-config.ts";
import connectDB from "./db/db.ts";
// import { checkAuthenticated } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler.ts";
// import facilityQuery from "./middlewares/facilityQuery";
// import ssrErrorHandler from "./middlewares/ssrErrorHandler";
// import facilityQuery from "./middlewares/facilityQuery";
// routes
import authRouter from "./routes/authRoutes.ts";
import facilityRouter from "./routes/facilityRoutes.ts";
import indexRouter from "./routes/indexRoute.ts";
import reservationRouter from "./routes/reservationRoutes.ts";
import tableRouter from "./routes/tableRoutes.ts";
import { findByEmail /* , findById */ } from "./services/userService.ts";
// import { ApplicationError } from "./utils/errors.ts";
// errors
// import { NotFoundError } from "./utils/errors.ts";

// Create an Express application
const app = express();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      name: string;
      role: string;
      email: string;
      facility?: Types.ObjectId;
    }
  }
}

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5174"],
};

/* // NOTE: just skip it for jwt authentication // if integration inside passport-config doesn't work, anyway remove findByEmail function parameters
initializePassport(
  passport,
  // (email: string) => users.find((user) => user.email === email),
  // (id: string) => users.find((user) => user.id === id),
  (email: string) => findByEmail(email),
  (id: string) => findById(id),
); */
initializePassport(
  passport,
  (email: string) => findByEmail(email),
  // (id: string) => findById(id),
);

app.use(cors(corsOptions));
app.use(cookieParser(config.JWT_SECRET));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());

// middleware

// app.use(passport.initialize()); // init passport on every route call

// ROUTES

// JWT Strategy
// app.get('/protected', function(req, res, next) {
//   passport.authenticate('local', function(err, user, info, status) {
//     if (err) { return next(err) }
//     if (!user) { return res.redirect('/signin') }
//     res.redirect('/account');
//   })(req, res, next);
// });

app.get(
  "/error",
  // checkAuthenticated,
  // ssrErrorHandler({
  //   // redirect: "/",
  //   render: "index",
  //   messages: "Error testing",
  // }),
  // (req, res) => {
  //   res.render("index", {
  //     name: "John Doe",
  //     facilities: [
  //       { name: "Facility 1", address: "via Uno" },
  //       { name: "Facility 2", address: "via Due" },
  //     ],
  //     messages: "Error creating Facility",
  //   });
  // },
);

app.use("/", indexRouter);
app.use("/auth", authRouter);

// for jwt
// app.use('/api/users', userRouter);

app.use("/facilities", facilityRouter);
app.use("/tables", tableRouter);
app.use("/reservations", reservationRouter);

// Define a route for the test path ('/test')
app.get("/test", (_: Request, res: Response) => {
  // Send a response to the client
  // res.send("Ciao, TypeScript + Node.js + Express!");

  res.status(200).json({ message: "Ciao, TypeScript + Node.js + Express!" });
  // res.render("index", {
  //   name: "John Doe",
  //   facilities: [
  //     { name: "Facility 1", address: "via Uno" },
  //     { name: "Facility 2", address: "via Due" },
  //   ],
  //   messages: "Error creating Facility!!!",
  // });
});

// after all routes defined
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: `The page ${req.path} does not exist!` });
});

// if is SSR mode, do not use it!
// app.use(errorHandler);

/**
 * Error Handler.
 */
app.use(errorHandler);
// if (process.env.NODE_ENV !== "production") {
//   // only use in development
//   app.use(errorHandler);
// } else {
//   app.use(
//     (
//       err: ApplicationError,
//       req: Request,
//       res: Response,
//       next: NextFunction,
//     ) => {
//       if (res.headersSent) {
//         next(err);
//       }
//       console.error(err);
//       res.status(500).json({ message: "Server Error" });
//     },
//   );
// }

const start = async () => {
  await connectDB();
  const port = config.PORT;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port.toString()}`);
  });
};

start().catch((/* err: unknown */) => {
  console.log("Error starting the server");
});
