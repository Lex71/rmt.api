import express, { NextFunction, Request, Response } from "express";
import expressLayouts from "express-ejs-layouts";
import flash from "express-flash";
import session from "express-session";
import methodOverride from "method-override";
import { Types } from "mongoose";
// passport
import passport from "passport";

// OR use this for jwt authentication instead
// const passport = require("./middlewares/passport"); // if integration inside passport-config doesn't work
import config from "./config/config";
// config
// NOTE: just skip it for jwt authentication
import initializePassport from "./config/passport-config";
import connectDB from "./db/db";
// import { checkAuthenticated } from "./middlewares/auth";
import { errorHandler } from "./middlewares/errorHandler";
// import facilityQuery from "./middlewares/facilityQuery";
// import ssrErrorHandler from "./middlewares/ssrErrorHandler";
// import facilityQuery from "./middlewares/facilityQuery";
// routes
import authRouter from "./routes/authRoutes";
import facilityRouter from "./routes/facilityRoutes";
import indexRouter from "./routes/indexRoute";
import reservationRouter from "./routes/reservationRoutes";
import tableRouter from "./routes/tableRoutes";
import { findByEmail, findById } from "./services/userService";
import { ApplicationError } from "./utils/errors";
// errors
// import { NotFoundError } from "./utils/errors";

// Create an Express application
const app = express();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      facility?: Types.ObjectId;
      // password: string;
      role: string;
    }
  }
}

// NOTE: just skip it for jwt authentication // if integration inside passport-config doesn't work, anyway remove findByEmail function parameters
initializePassport(
  passport,
  // (email: string) => users.find((user) => user.email === email),
  // (id: string) => users.find((user) => user.id === id),
  (email: string) => findByEmail(email),
  (id: string) => findById(id),
);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method")); // append to query string to override method: ?_method=DELETE|PUT
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());
app.use(flash());

// middleware
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: config.SESSION_SECRET,
  }),
);

app.use(passport.initialize()); // init passport on every route call
app.use(passport.session()); //allow passport to use "express-session"

// app.use((req, res, next) => {
//   res.locals.messages = req.flash("messages");
//   next();
// });

// facilityQuery middleware
// const routes = [/^\/facilities\/create$/, /^\/facilities\/\d+\/edit$/];
/* const routesRegExp = [
  // /^\/facilities\/?.*$/,
  /^\/tables\/?.*$/,
  /^\/reservations\/?.*$/,
];

app.use(facilityQuery(routesRegExp)); */

// ROUTES
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
  // throw new NotFoundError("Resource not found on this server");
  req.flash("error", `The page ${req.path} does not exist!`);
  res.render("404", { layout: "layouts/error" });
});

// if is SSR mode, do not use it!
// app.use(errorHandler);

/**
 * Error Handler.
 */
if (process.env.NODE_ENV !== "production") {
  // only use in development
  app.use(errorHandler);
} else {
  app.use(
    (
      err: ApplicationError,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      if (res.headersSent) {
        next(err);
        return;
      }
      console.error(err);
      res.status(500).send("Server Error");
    },
  );
}

// Specify the port number for the server
// const port: number = +(process.env.PORT || 3000);
// const port = config.PORT;

// Start the server and listen on the specified port

// app.listen(port, () => {
//   // Log a message when the server is successfully running
//   console.log(`Server is running on http://localhost:${port}`);
// });
const start = async () => {
  await connectDB();
  const port = config.PORT;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port.toString()}`);
  });
};

start().catch((err: unknown) => {
  console.log(err);
});

// import Facility from "./models/facility";
// import Table from "./models/table";

/* const test = async () => {
  const f1 = await Facility.create({
    address: "via Uno",
    name: "Facility 1",
  }).catch((err) => console.log(err));

  const f2 = await Facility.create({ address: "via Due", name: "Facility 2" });

  const t1 = await Table.create({
    description: "SmallTable",
    facility: f1._id,
    name: "Table 1",
    seats: 1,
  });

  const t3 = await Table.create({
    description: "Big Table",
    facility: f1,
    name: "Table 3",
    seats: 3,
  });

  f1.tables.push(t1, t3);
  f1.save();

  const t2 = await Table.create({
    description: "Medium Table",
    facility: f2,
    name: "Table 2",
    seats: 2,
  });

  const d = Facility.findById(f1);
}; */

// test();
