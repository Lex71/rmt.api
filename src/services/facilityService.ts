import { name } from "ejs";
import Facility, {
  FacilitySearchOptionsType,
  IFacility,
} from "../models/facility";

// const facilities: IFacility[] = [];

export const findById = async (id: string) => {
  try {
    // return await Facility.findById(id);
    return await Facility.findById(id).populate("tables");
  } catch (err) {
    throw new Error("Facility not found");
  }
};

/* export const find = async (searchOptions: FacilitySearchOptionsType) => {
  // return facilities;
  console.log(searchOptions);
  try {
    let query = Facility.find();
    if (
      searchOptions.query != null &&
      Object.keys(searchOptions.query).length
    ) {
      for (const [k, v] of Object.entries(searchOptions.query)) {
        console.log(k, v);
        query = query.regex(k, v as RegExp);
      }
    }
    // return await Facility.find(searchOptions.query as any);
    return await query.exec();
  } catch (err) {
    throw new Error("Cannot find Facilities");
  }
}; */
export const find = async (searchOptions?: FacilitySearchOptionsType) => {
  try {
    let query = Facility.find();
    // add regex filters to query
    if (
      searchOptions != null &&
      searchOptions.query != null &&
      Object.keys(searchOptions.query).length
    ) {
      for (const [k, v] of Object.entries(searchOptions.query)) {
        if (v != null && v != "") {
          query = query.regex(k, new RegExp(v.toString(), "i"));
        }
      }
    }

    return await query.exec();
  } catch (err) {
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
  const { name, address } = body;

  const facility: IFacility = new Facility({
    name,
    address,
  });

  try {
    return await facility.save();
  } catch (err) {
    throw new Error("Cannot create Facility");
  }
};

export const update = async (id: string, body: IFacility) => {
  // let facility: IFacility | null = null;
  // try {
  //   facility = await Facility.findById(id);
  //   if (facility) {
  //     facility.name = body.name;
  //     facility.address = body.address;
  //     await facility.save();
  //     return facility;
  //   }
  // } catch (err) {
  //   throw new Error("Cannot update: Facility not found");
  // }
  try {
    return await Facility.findOneAndUpdate({ id }, body);
  } catch (err) {
    throw new Error("Cannot update: Facility not found");
  }
};

export const remove = async (id: string) => {
  try {
    return await Facility.deleteOne({ id });
  } catch (err) {
    throw new Error("Cannot deleteOne: Facility not found");
  }
};
