import mongoose, { Types } from "mongoose";

// import config from "../config/config";
import Facility from "../../models/facility";
import Table, {
  ITable,
  tableSchema,
  TableSearchOptionsType,
} from "../../models/table";

export const findById = async (id: string) => {
  try {
    return await Table.findById(id).orFail();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Table not found");
  }
};

export const find = async (searchOptions?: TableSearchOptionsType) => {
  try {
    let query = Table.find();
    if (
      searchOptions?.query != null &&
      Object.keys(searchOptions.query).length
    ) {
      for (const [k, v] of Object.entries(searchOptions.query)) {
        if (typeof v === "string" && v != "") {
          switch (tableSchema.path(k).instance) {
            case "Number":
              query = query.where(k, Number(v));
              break;
            default:
              if (k === "facility") {
                query = query.where(k, new Types.ObjectId(v));
                break;
              }
              query = query.regex(k, new RegExp(v, "i"));
              break;
          }
        }
      }
    }
    query = query.sort({ _id: -1 });
    return await query.exec();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot find Tables");
  }
};

/* function waitForMongooseConnection(mongoose: typeof import("mongoose")) {
  return new Promise<void>((resolve) => {
    const connection = mongoose.connection;
    if (connection.readyState === mongoose.ConnectionStates.connected) {
      resolve();
      return;
    }
    console.log(
      "Mongoose connection is not ready. Waiting for open or reconnect event.",
    );
    let resolved = false;
    const setResolved = () => {
      console.log(
        "Mongoose connection became ready. promise already resolved: " +
          (resolved ? "true" : "false"),
      );
      if (!resolved) {
        console.log("Resolving waitForMongooseConnection");
        resolved = true;
        resolve();
      }
    };
    connection.once("open", setResolved);
    connection.once("reconnect", setResolved);
  });
}
 */
export const create = async (body: Partial<ITable>) => {
  // const newTable = new Table(body);

  const facility = body.facility; // the ._id of the facility model
  const db = mongoose.connection;
  const session = await db.startSession();
  // const session = await startSession();
  try {
    session.startTransaction();
    // if (facility != null) {
    // save the new table
    // await newTable.save();
    const newTable = await Table.create(body);
    // update the facility.tables array
    await Facility.findByIdAndUpdate(facility, {
      $push: { tables: newTable },
    }).orFail();

    await session.commitTransaction();
    return newTable;
  } catch (err: unknown) {
    await session.abortTransaction();
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Error creating  table");
  } finally {
    await session.endSession();
  }
};

export const update = async (id: string, body: Partial<ITable>) => {
  try {
    // const filter = { facility: body.facility, id };
    return await Table.findByIdAndUpdate(id, body, { new: true }).orFail();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Error updating table");
  }
};

export const remove = async (id: string) => {
  try {
    return await Table.findByIdAndDelete(id);
    // return await Table.deleteOne({ id });
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot findByIdAndDelete: Table not found");
  }
};
