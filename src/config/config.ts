import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const PORT = +(process.env.PORT ?? 3000);
const MONGODB_URL = process.env.MONGODB_URL ?? "";
// const SESSION_SECRET = process.env.SESSION_SECRET ?? "mysecret";
const AVERAGE_STAYING_TIME = +(process.env.AVERAGE_STAYING_TIME ?? 90);
const JWT_SECRET = process.env.JWT_SECRET ?? "verystrongkey";
const RMT_APP_URL = process.env.RMT_APP_URL ?? "http://localhost:3000";

export default {
  AVERAGE_STAYING_TIME,
  MONGODB_URL,
  PORT,
  // SESSION_SECRET,
  JWT_SECRET,
  RMT_APP_URL,
};
