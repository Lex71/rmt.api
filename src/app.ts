import express, { Application, Request, Response } from "express";
import { Types } from "mongoose";
// passport
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
//TODO: add morgan logging
// const morgan = require('morgan');

/*
const morganMiddleware = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    immediate: true, // write before response is sent
    stream: {
      write: (message) => console.log(message.trim()),
    },
  }
);
*/

// app.use(morganMiddleware);

// OR use this for jwt authentication instead
// const passport = require("./middlewares/passport"); // if integration inside passport-config doesn't work

// config
// NOTE: just skip it for jwt authentication
import initializePassport from "./config/passport-config";

import { errorHandler } from "./middlewares/errorHandler";
// routes
// import authRouter from "./routes/authRoutes";
// import facilityRouter from "./routes/facilityRoutes";
// import indexRouter from "./routes/indexRoute";
// import passwordRouter from "./routes/passwordRoutes";
// import refreshTokenRouter from "./routes/refreshTokenRoutes";
// import reservationRouter from "./routes/reservationRoutes";
// import tableRouter from "./routes/tableRoutes";

import { findByEmail /* , findById */ } from "./api/users/users.service";
import {
  authRouter,
  facilityRouter,
  homeRouter,
  passwordRouter,
  refreshTokenRouter,
  reservationRouter,
  tableRouter,
} from "./routes";
// import { zodMiddleware } from './middlewares/zod.validator';
// import { ApplicationError } from "./utils/errors";
// errors
// import { NotFoundError } from "./utils/errors";

// Create an Express application
const app: Application = express();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      // id: string;
      name: string;
      role: string;
      email: string;
      facility?: Types.ObjectId;
    }
  }
}

const corsOptions = {
  credentials: true,
  origin: ["http://localhost:5173", "http://localhost:5174"],
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
app.use(cookieParser(/* config.JWT_SECRET */));

app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());

app.use("/api", homeRouter);
app.use("/api/auth", authRouter);
app.use("/api/token", refreshTokenRouter);
// app.use('/api/users', userRouter);
app.use("/api/forgot-password", passwordRouter);

app.use("/api/facilities", facilityRouter);
app.use("/api/tables", tableRouter);
app.use("/api/reservations", reservationRouter);

// Define a route for the test path ('/test')
app.get("/test", (_: Request, res: Response) => {
  res.status(200).json({ data: "Hello from test route!" });
});

// after all routes defined
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: `The page ${req.path} does not exist!` });
});

// app.use(zodMiddleware);
/**
 * Error Handler.
 */
app.use(errorHandler);

export default app;
