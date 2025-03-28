import Facility, { IFacility } from "../models/facility";

function wait(t: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ name: "Prova", address: "via Mazzini 1, Milano" });
      // reject("rigettata");
    }, t);
  });
}

export const fetchIndexData = async () => {
  let facilities /* : IFacility[] */ = [];
  try {
    return await Facility.find(); /* .sort({ createdAt: "desc" }) */
    /* .limit(10)
      .exec() */
    // const ret = await wait(500);
    // facilities.push(ret);
  } catch {
    throw new Error("Cannot fetch index data");
    // facilities = [];
  }
  // return facilities;
};
