// import { jest } from "@jest/globals";
import { Types } from "mongoose";
import {
  create,
  find,
  findById,
  update,
} from "../../../src/api/facilities/facilities.service";
import Facility, { IFacility } from "../../../src/models/facility";
import { ITable } from "../../../src/models/table";
jest.mock("../../../src/models/table");
jest.mock("../../../src/models/facility");

// describe("Facility Service", () => {
//   // Plese do not use real model and database access
//   test("Retrieve facility by Id", async () => {
//     const id = "67ead7c4c8c556d2c551e945";
//     const facility = await FacilityService.findById(id);
//     expect(facility?.name).toBe("Facility 1");
//   });
// });
describe("Facilities service", () => {
  const facilityID = new Types.ObjectId();
  const tables: (ITable & { _id: Types.ObjectId })[] | ITable[] = [
    {
      _id: new Types.ObjectId(),
      facility: facilityID,
      name: "Table 1",
      seats: 4,
    },
  ];
  const facilities: IFacility[] = [
    {
      _id: facilityID,
      address: "Address 1",
      name: "Facility 1",
      tables,
    },
    {
      _id: new Types.ObjectId(),
      address: "Address 2",
      name: "Facility 2",
      tables: [],
    },
  ];

  // Create a mock for the Mongoose model
  // const MockFacilityModel = jest.fn().mockImplementation(() => {
  //   return {
  //     exec: jest.fn().mockResolvedValue(facilities),
  //     find: jest.fn().mockReturnThis(),
  //     findById: jest.fn().mockReturnThis(),
  //     orFail: jest.fn().mockResolvedValue(facilities),
  //     populate: jest.fn().mockReturnThis(),
  //     query: jest.fn().mockReturnThis(),
  //     where: jest.fn().mockReturnThis(),
  //   };
  // });

  // const MockFacilitySchema = jest.fn().mockImplementation(() => {
  //   return {
  //     address: { required: true, type: String },
  //     instance: jest.fn().mockReturnThis(),
  //     name: { required: true, type: String },
  //     path: jest.fn().mockReturnThis(),
  //   };
  // });

  // beforeEach(() => {
  //   // Spy on the findById method
  //   jest.spyOn(model, "findById").mockImplementation((id) => {
  //     // Return an object that mimics the Mongoose query chain
  //     return {
  //       orFail: jest.fn().mockResolvedValue(mockDoc),
  //     };
  //   });
  // });

  // afterEach(() => {
  //   jest.restoreAllMocks();
  // });

  it("should return the documentby id", async () => {
    (Facility.findById as jest.Mock).mockImplementation(
      jest.fn().mockImplementation(() => {
        return {
          exec: jest
            .fn()
            .mockResolvedValueOnce(
              facilities.find((f) => f._id === facilityID),
            ),
          find: jest.fn().mockReturnThis(),
          findById: jest.fn().mockReturnThis(),
          orFail: jest
            .fn()
            .mockResolvedValueOnce(
              facilities.find((f) => f._id === facilityID),
            ),
          populate: jest.fn().mockReturnThis(),
          query: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        };
      }),
    );

    const result = await findById(facilityID.toString());

    expect(result).toEqual(facilities.find((f) => f._id === facilityID));
  });

  it("should return null if no document found", async () => {
    (Facility.findById as jest.Mock).mockImplementation(
      jest.fn().mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValueOnce(null),
          find: jest.fn().mockReturnThis(),
          findById: jest.fn().mockReturnThis(),
          orFail: jest.fn().mockResolvedValueOnce(null),
          populate: jest.fn().mockReturnThis(),
          query: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        };
      }),
    );

    const result = await findById("12234");

    expect(result).toEqual(null);
  });

  it("should throw 'Facility not found' error if generic error occurs", async () => {
    (Facility.findById as jest.Mock).mockImplementation(
      jest.fn().mockImplementation(() => {
        return {
          exec: jest.fn().mockReturnValueOnce(null),
          find: jest.fn().mockReturnThis(),
          findById: jest.fn().mockReturnThis(),
          orFail: jest.fn().mockImplementationOnce(() => {
            throw new Error("");
          }),
          populate: jest.fn().mockReturnThis(),
          query: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        };
      }),
    );

    await expect(findById("12234")).rejects.toThrow("Facility not found");
  });

  it("should return the list of facilities", async () => {
    (Facility.find as jest.Mock).mockImplementation(
      jest.fn().mockImplementation(() => {
        return {
          exec: jest.fn().mockResolvedValueOnce(facilities),
          find: jest.fn().mockReturnThis(),
          findById: jest.fn().mockReturnThis(),
          orFail: jest.fn().mockResolvedValueOnce(null),
          populate: jest.fn().mockReturnThis(),
          query: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        };
      }),
    );

    const result = await find();
    expect(result).toHaveLength(facilities.length);
    expect(result[0]).toMatchObject({ name: "Facility 1" });
    expect(result[1]).toHaveProperty("tables", []);
  });

  it("should create the facility", async () => {
    // (Facility.create as jest.Mock).mockImplementation(
    //   jest.fn().mockImplementation(() => {
    //     return {
    //       create: jest.fn().mockReturnThis(),
    //       exec: jest.fn().mockResolvedValueOnce(facilities[0]),
    //       // create: jest.fn().mockResolvedValueOnce(facilities[0]),
    //       find: jest.fn().mockReturnThis(),
    //       findById: jest.fn().mockReturnThis(),
    //       orFail: jest.fn().mockResolvedValueOnce(null),
    //       populate: jest.fn().mockReturnThis(),
    //       query: jest.fn().mockReturnThis(),
    //       where: jest.fn().mockReturnThis(),
    //     };
    //   }),
    // );
    (Facility.create as jest.Mock).mockResolvedValue(facilities[0]);
    const result = await create(facilities[0]);
    expect(result).toMatchObject(facilities[0]);
  });

  it("should update the doc", async () => {
    const ID = facilities[1]._id?.toString() ?? "";
    const new_address = "Address 1 Updated";
    /* (Facility.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce({
      ...facilities[1],
      address: new_address,
    }); */
    (Facility.findByIdAndUpdate as jest.Mock).mockImplementation(
      jest.fn().mockImplementation(() => {
        return {
          exec: jest
            .fn()
            .mockResolvedValueOnce({ ...facilities[1], address: new_address }),
          find: jest.fn().mockReturnThis(),
          findById: jest.fn().mockReturnThis(),
          orFail: jest
            .fn()
            .mockResolvedValueOnce({ ...facilities[1], address: new_address }),
          populate: jest.fn().mockReturnThis(),
          query: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
        };
      }),
    );
    // jest.spyOn(Facility, "findByIdAndUpdate").mockResolvedValueOnce({
    //   ...facilities[1],
    //   address: new_address,
    // });
    const res = await update(ID, { address: new_address });
    expect(res).toHaveProperty("address", "Address 1 Updated");
    // expect(JSON.parse(JSON.stringify(res))).toMatchObject(_doc);
  });
});
