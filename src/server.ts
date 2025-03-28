import express, { Request, Response } from "express";
import expressLayouts from "express-ejs-layouts";
import flash from "express-flash";
import session from "express-session";
import methodOverride from "method-override";
import connectDB from "./db/db";
// passport
import passport from "passport";
// OR use this for jwt authentication instead
// const passport = require("./middlewares/passport"); // if integration inside passport-config doesn't work
import config from "./config/config";
// errors
import { NotFoundError } from "./utils/errors";

// config
// NOTE: just skip it for jwt authentication
import initializePassport from "./config/passport-config";

// routes
import authRouter from "./routes/authRoutes";
import facilityRouter from "./routes/facilityRoutes";
import indexRouter from "./routes/indexRoute";

// import { checkAuthenticated } from "./middlewares/auth";
// import { errorHandler } from "./middlewares/errorHandler";
// import ssrErrorHandler from "./middlewares/ssrErrorHandler";
import facilityQuery from "./middlewares/facilityQuery";
import { findByEmail, findById } from "./services/userService";

// import Facility, { IFacility } from "./models/facility";

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      password: string;
      role: string;
      facility?: string;
    }
  }
}

// Create an Express application
const app = express();

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
app.use(express.json());
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(flash());

// middleware
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
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
const routesRegExp = [
  // /^\/facilities\/?.*$/,
  /^\/tables\/?.*$/,
  /^\/other-route\/?.*$/,
];

app.use(facilityQuery(routesRegExp));

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

// Define a route for the test path ('/test')
app.get("/test", (_: Request, res: Response) => {
  // Send a response to the client
  res.send("Ciao, TypeScript + Node.js + Express!");
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
app.all("*", (req, res) => {
  // throw new NotFoundError("Resource not found on this server");
  req.flash("error", `The page ${req.path} does not exist!`);
  res.render("404", { layout: "layouts/error" });
});

// if is SSR mode, do not use it!
// app.use(errorHandler);

/**
 * Error Handler.
 */
/* if (process.env.NODE_ENV === 'development') {
  only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
} */

// Specify the port number for the server
// const port: number = +(process.env.PORT || 3000);
// const port = config.PORT;

// Start the server and listen on the specified port

// app.listen(port, () => {
//   // Log a message when the server is successfully running
//   console.log(`Server is running on http://localhost:${port}`);
// });
async function start() {
  try {
    connectDB();
    const port = config.PORT;
    app.listen(port, () =>
      console.log(`Server is running on http://localhost:${port}`),
    );
  } catch (error) {
    console.error(error);
  }
}

start();
