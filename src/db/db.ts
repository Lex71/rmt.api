import mongoose from "mongoose";
import config from "../config/config";

const dbOptions = {
  // autoReconnect: true,
  // reconnectTries: 30,
  // poolSize: 10,
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 1000,
};
/* await mongoose.connect(config.MONGODB_URL, dbOptions);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose")); */

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(config.MONGODB_URL, dbOptions);
    console.log("MongoDB connected");
    // const f = await Facility.find();
    // console.log(f);
    const db = mongoose.connection;
    db.on("error", (error) => console.error(error));
    db.once("open", () => console.log("Connected to Mongoose"));
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
