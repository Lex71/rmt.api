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
import { errorHandler } from "./middlewares/errorHandler.ts";
// routes
import authRouter from "./routes/authRoutes.ts";
import facilityRouter from "./routes/facilityRoutes.ts";
import indexRouter from "./routes/indexRoute.ts";
import refreshTokenRouter from "./routes/refreshTokenRoutes.ts";
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

app.use("/api", indexRouter);
app.use("/api/auth", authRouter);
app.use("/api/token", refreshTokenRouter);
// app.use('/api/users', userRouter);

app.use("/api/facilities", facilityRouter);
app.use("/api/tables", tableRouter);
app.use("/api/reservations", reservationRouter);

// Define a route for the test path ('/test')
app.get("/test", (_: Request, res: Response) => {
  res.status(200).json({ message: "Ciao, TypeScript + Node.js + Express!" });
});

// after all routes defined
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: `The page ${req.path} does not exist!` });
});

/**
 * Error Handler.
 */
app.use(errorHandler);

const start = async () => {
  const conn = await connectDB();
  if (!conn) {
    throw new Error("Error on database connection");
  }
  const port = config.PORT;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port.toString()}`);
  });
};

start().catch((err: unknown) => {
  console.log(err);
});
