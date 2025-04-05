import Facility from "../models/facility";
import Table from "../models/table";

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

export const fetchIndexData = async (isAdmin = false) => {
  // let facilities : IFacility[] = [];
  const query = isAdmin ? Facility.find() : Table.find();
  try {
    // return await Facility.find(); /* .sort({ createdAt: "desc" }) */

    return await query.sort({ _id: -1 }).limit(3).exec();
  } catch {
    throw new Error("Cannot fetch index data");
  }
};
