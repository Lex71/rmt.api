import mongoose, { Types } from "mongoose";

// import config from "../config/config";
import Facility from "../models/facility";
import Table, {
  ITable,
  tableSchema,
  TableSearchOptionsType,
} from "../models/table";

export const findById = async (id: string) => {
  try {
    // return await Table.findById(id);
    return await Table.findById(id); //.populate("reservations").exec();
  } catch {
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
  // const table = new Table(body);
  // try{
  //   return await table.save();
  // } catch {
  //   throw new Error("Cannot create Table");
  // }
  /* const { description, facility, name, seats } = body;
  const newTable = new Table({
    description,
    facility,
    name,
    seats,
  }); */
  const newTable = new Table(body);

  const facility = body.facility; // the ._id of the facility model
  // await connect(config.MONGODB_URL, {
  //   heartbeatFrequencyMS: 1000,
  //   // autoReconnect: true,
  //   // reconnectTries: 30,
  //   // poolSize: 10,
  //   serverSelectionTimeoutMS: 5000,
  // });
  // Wait for the connection to be ready before starting a session
  // await mongoose.connect(config.MONGODB_URL, {});
  // await waitForMongooseConnection(mongoose);
  const db = mongoose.connection;
  const session = await db.startSession();
  // const session = await startSession();
  try {
    session.startTransaction();
    // if (facility != null) {
    // save the new table
    await newTable.save();
    // update the facility.tables array
    await Facility.findByIdAndUpdate(facility, {
      $push: { tables: newTable },
    });

    await session.commitTransaction();
    return newTable;
    /* const f = await Facility.findById(facility._id);
      if (f) {
        // save the new table...
        await newTable.save();
        // update the facility.tables array
        f.tables.push(newTable._id);
        // save the facility
        await f.save();
        // TODO: if f.save() fails, delete the newTable
        return newTable;
      } */
    // } else {
    //   throw new Error("Cannot create Table because cannot find Facility");
    // }
  } catch (err: unknown) {
    await session.abortTransaction();
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    throw new Error("Cannot create Table");
  } finally {
    await session.endSession();
  }
};

export const update = async (id: string, body: Partial<ITable>) => {
  // let table: ITable | null = null;
  // try {
  //   table = await Table.findById(id);
  //   if (table) {
  //     table.name = body.name;
  //     table.address = body.address;
  //     await table.save();
  //     return table;
  //   }
  // } catch (err) {
  //   throw new Error("Cannot update: Table not found");
  // }
  try {
    // const filter = { facility: body.facility, id };
    return await Table.findByIdAndUpdate(id, body, { new: true });
  } catch (err) {
    console.log(err);
    throw new Error("Cannot update: Table not found");
  }
};

export const remove = async (id: string) => {
  try {
    return await Table.findByIdAndDelete(id);
    // return await Table.deleteOne({ id });
  } catch {
    throw new Error("Cannot findByIdAndDelete: Table not found");
  }
};
