import app from "./app";
import config from "./config/config";
import { connectDB } from "./db/db";

const start = async () => {
  const conn = await connectDB();
  if (!conn) {
    throw new Error("Error on database connection");
  }
  const port = config.PORT;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port: ${port.toString()}`);
  });
};

start().catch((err: unknown) => {
  console.log(err);
});
