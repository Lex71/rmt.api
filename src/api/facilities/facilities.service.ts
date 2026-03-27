import mongoose, { HydratedDocument } from "mongoose";
import Facility, {
  FacilitySearchOptionsType,
  IFacility,
} from "../../models/facility";
import { ITable } from "../../models/table";

export const findById = async (
  id: string,
): Promise<HydratedDocument<IFacility> | null> => {
  try {
    return await Facility.findById(id)
      .populate<{ tables: ITable[] }>("tables")
      .orFail();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Facility not found");
  }
};

export const find = async (
  searchOptions?: FacilitySearchOptionsType,
): Promise<HydratedDocument<IFacility>[]> => {
  try {
    let query = Facility.find();
    // add regex filters to query
    if (
      searchOptions?.query != null &&
      Object.keys(searchOptions.query).length
    ) {
      for (const [k, v] of Object.entries(searchOptions.query)) {
        if (typeof v === "string" && v != "") {
          query = query.regex(k, new RegExp(v, "i"));
        }
      }
    }
    return await query.exec();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot find Facilities");
  }
};

export const create = async (
  body: IFacility,
): Promise<HydratedDocument<IFacility> | null> => {
  const { address, name } = body;

  try {
    return await Facility.create({ address, name });
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Error creating  facility");
  }
};

export const update = async (
  id: string,
  body: Partial<IFacility>,
): Promise<HydratedDocument<IFacility> | null> => {
  try {
    return await Facility.findByIdAndUpdate(id, body, { new: true }).orFail();
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Error updating facility");
  }
};

export const remove = async (
  id: string,
): Promise<HydratedDocument<IFacility> | null> => {
  try {
    // return await Facility.deleteOne({ _id: id });
    return await Facility.findByIdAndDelete(id);
  } catch (err) {
    if (err instanceof mongoose.MongooseError) {
      console.log(err.message);
      throw new Error(err.message);
    }
    console.log(err);
    throw new Error("Cannot deleteOne: Facility not found");
  }
};
