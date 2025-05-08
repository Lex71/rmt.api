import Facility, {
  FacilitySearchOptionsType,
  IFacility,
} from "../models/facility";
import { ITable } from "../models/table";

export const findById = async (id: string): Promise<IFacility> => {
  console.log("id", id);
  try {
    // return await Facility.findById(id);
    return await Facility.findById(id)
      .populate<{ tables: ITable[] }>("tables")
      .orFail();
  } catch {
    throw new Error("Facility not found");
  }
};

export const find = async (searchOptions?: FacilitySearchOptionsType) => {
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
  } catch {
    throw new Error("Cannot find Facilities");
  }
};

export const create = async (body: IFacility) => {
  const { address, name } = body;

  try {
    return await Facility.create({ address, name });
  } catch {
    throw new Error("Cannot create Facility");
  }
};

export const update = async (id: string, body: IFacility) => {
  try {
    return await Facility.findByIdAndUpdate(id, body, { new: true }).orFail();
  } catch {
    throw new Error("Cannot update facility");
  }
};

export const remove = async (id: string) => {
  try {
    return await Facility.deleteOne({ _id: id });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error("Unable to remove facility");
    }
  }
};
