import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const PORT = +(process.env.PORT ?? 3000);
const MONGODB_URL = process.env.MONGODB_URL ?? "";
// const SESSION_SECRET = process.env.SESSION_SECRET ?? "mysecret";
const AVERAGE_STAYING_TIME = +(process.env.AVERAGE_STAYING_TIME ?? 90);
const JWT_SECRET = process.env.JWT_SECRET ?? "verystrongkey";
const RMT_APP_BASE_URL =
  process.env.RMT_APP_BASE_URL ?? "http://localhost:5173";
const SMTP_HOST = process.env.SMTP_HOST ?? "smtp.mailtrap.io";
const SMTP_PORT = +(process.env.SMTP_PORT ?? "25");
const SMTP_USER = process.env.SMTP_USER ?? "user";
const SMTP_PASS = process.env.SMTP_PASS ?? "pass";
const SMTP_FROM = process.env.SMTP_FROM ?? "info@rmt.com";

export default {
  AVERAGE_STAYING_TIME,
  MONGODB_URL,
  PORT,
  // SESSION_SECRET,
  JWT_SECRET,
  RMT_APP_BASE_URL,
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER,
};
