import app from "./app.ts";
import config from "./config/config.ts";
import { connectDB } from "./db/db.ts";

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
