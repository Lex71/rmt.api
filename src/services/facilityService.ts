import Facility, {
  FacilitySearchOptionsType,
  IFacility,
} from "../models/facility.ts";
import { ITable } from "../models/table.ts";

export const findById = async (id: string) => {
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
  // facilities.push(facility);
  // return facilities;
  // const facility: IFacility = new Facility({
  //   name: body.name,
  //   address: body.address,
  // });

  /* try {
    // return await facility.save();
    return await Facility.create(body);
  } catch (err) {
    // renderNewPage(res, facility, true);
    throw err;
  } */
  const { address, name } = body;

  const facility = new Facility({
    address,
    name,
  });

  try {
    return await facility.save();
  } catch {
    throw new Error("Cannot create Facility");
  }
};

export const update = async (id: string, body: IFacility) => {
  try {
    return await Facility.findByIdAndUpdate(id, body, { new: true });
  } catch {
    throw new Error("Cannot update: Facility not found");
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
