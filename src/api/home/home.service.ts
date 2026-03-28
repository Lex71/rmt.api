import { type HydratedDocument, Types } from "mongoose";
import Facility, { IFacility } from "../../models/facility";
import Table, { ITable } from "../../models/table";

/* function wait(t: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ name: "Prova", address: "via Mazzini 1, Milano" });
      // reject("rigettata");
    }, t);
  });
  // usage:
  //    let facilities : IFacility[] = [];
  //
  //    facilities = await wait(500);
  //    return facilities;
} */

export const fetchIndexData = async (
  facility: Types.ObjectId | undefined,
  isAdmin: boolean,
): Promise<HydratedDocument<IFacility | ITable>[] | null> => {
  // let facilities : IFacility[] = [];

  let query = isAdmin ? Facility.find() : Table.find();
  if (facility) {
    query = query.where("facility", new Types.ObjectId(facility));
  }
  try {
    return await query.sort({ _id: -1 }).limit(3).exec();
  } catch {
    throw new Error("Cannot fetch index data");
  }
};
