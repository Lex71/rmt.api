import { /* Model, Schema,*/ Types } from "mongoose";

import { findAvailableTables } from "../../../src/api/reservations/reservations.service";
import Reservation, {
  IReservation,
  ReservationSearchOptionsType,
  Status,
  reservationSchema,
} from "../../../src/models/reservation";
import Table, { ITable /*,  { IFacility } */ } from "../../../src/models/table";
jest.mock("../../../src/models/table");
jest.mock("../../../src/models/reservation");

describe("findAvailableTables method", () => {
  const facilityID = new Types.ObjectId();
  const tables: (ITable & { _id: Types.ObjectId })[] | ITable[] = [
    {
      _id: new Types.ObjectId(),
      facility: facilityID,
      name: "Table 1",
      seats: 4,
    },
  ];

  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
  it("should return empty array if the only one table is reserved, and time overlaps", async () => {
    const adjust = 0;
    // const facilityID = new Types.ObjectId();
    const searchOptions: ReservationSearchOptionsType = {
      query: {
        date: "2023-05-01",
        facility: facilityID.toString(),
        time: "12:00",
      },
    };

    const reservations:
      | (IReservation & { _id: Types.ObjectId })[]
      | IReservation[] = [
      {
        _id: new Types.ObjectId(),
        date: "2023-05-01",
        facility: facilityID,
        name: "Reservation 1",
        phone: "1234567890",
        seats: 4,
        status: Status.CONFIRMED,
        tables: tables,
        time: "12:00",
      },
    ];

    // Create a mock for the Mongoose model
    const MockReservationModel = jest.fn().mockImplementation(() => {
      return {
        exec: jest.fn().mockResolvedValue(reservations),
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        query: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
    });

    const MockReservationSchema = jest.fn().mockImplementation(() => {
      return {
        date: { required: true, type: String },
        facility: { required: true, type: String },
        instance: jest.fn().mockReturnThis(),
        path: jest.fn().mockReturnThis(),
        time: { required: true, type: String },
      };
    });

    jest
      .spyOn(reservationSchema, "path")
      .mockImplementation(MockReservationSchema);

    // Replace the actual model with the mock
    (Reservation.find as jest.Mock).mockImplementation(MockReservationModel);

    (Table.find as jest.Mock).mockResolvedValue(tables);
    // (Reservation.find as jest.Mock).mockResolvedValue(reservations);
    const res = await findAvailableTables(adjust, searchOptions);
    expect(res).toEqual([]);
  });

  it("should return the only one table if there are no reservations", async () => {
    const adjust = 0;
    const facilityID = new Types.ObjectId();
    const searchOptions: ReservationSearchOptionsType = {
      query: {
        date: "2023-05-01",
        facility: facilityID.toString(),
        time: "13:00",
      },
    };

    const reservations: IReservation[] = [];

    // Create a mock for the Mongoose model
    const MockReservationModel = jest.fn().mockImplementation(() => {
      return {
        exec: jest.fn().mockResolvedValue(reservations),
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        query: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
    });

    const MockReservationSchema = jest.fn().mockImplementation(() => {
      return {
        date: { required: true, type: String },
        facility: { required: true, type: String },
        instance: jest.fn().mockReturnThis(),
        path: jest.fn().mockReturnThis(),
        time: { required: true, type: String },
      };
    });

    jest
      .spyOn(reservationSchema, "path")
      .mockImplementation(MockReservationSchema);

    (Reservation.find as jest.Mock).mockImplementation(MockReservationModel);
    (Table.find as jest.Mock).mockResolvedValue(tables);
    const res = await findAvailableTables(adjust, searchOptions);
    expect(res).toEqual(tables);
  });

  it("should return a table if the only one table is reserved, and time does not overlap", async () => {
    const adjust = 0;
    const facilityID = new Types.ObjectId();
    const searchOptions: ReservationSearchOptionsType = {
      query: {
        date: "2023-05-01",
        facility: facilityID.toString(),
        time: "14:00",
      },
    };

    const reservations:
      | (IReservation & { _id: Types.ObjectId })[]
      | IReservation[] = [
      {
        _id: new Types.ObjectId(),
        date: "2023-05-01",
        facility: facilityID,
        name: "Reservation 1",
        phone: "1234567890",
        seats: 4,
        status: Status.CONFIRMED,
        tables: tables,
        time: "12:00",
      },
    ];

    // Create a mock for the Mongoose model
    const MockReservationModel = jest.fn().mockImplementation(() => {
      return {
        exec: jest.fn().mockResolvedValue(reservations),
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        query: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
    });

    const MockReservationSchema = jest.fn().mockImplementation(() => {
      return {
        date: { required: true, type: String },
        facility: { required: true, type: String },
        instance: jest.fn().mockReturnThis(),
        path: jest.fn().mockReturnThis(),
        time: { required: true, type: String },
      };
    });

    jest
      .spyOn(reservationSchema, "path")
      .mockImplementation(MockReservationSchema);

    (Reservation.find as jest.Mock).mockImplementation(MockReservationModel);
    (Table.find as jest.Mock).mockResolvedValue(tables);
    const res = await findAvailableTables(adjust, searchOptions);
    expect(res).toEqual(tables);
  });

  it("should return a table if the only one table is reserved, and adjusted time does not overlap", async () => {
    const adjust = 31;
    const facilityID = new Types.ObjectId();
    const searchOptions: ReservationSearchOptionsType = {
      query: {
        date: "2023-05-01",
        facility: facilityID.toString(),
        time: "13:00",
      },
    };

    const reservations:
      | (IReservation & { _id: Types.ObjectId })[]
      | IReservation[] = [
      {
        _id: new Types.ObjectId(),
        date: "2023-05-01",
        facility: facilityID,
        name: "Reservation 1",
        phone: "1234567890",
        seats: 4,
        status: Status.CONFIRMED,
        tables: tables,
        time: "12:00",
      },
    ];

    // Create a mock for the Mongoose model
    const MockReservationModel = jest.fn().mockImplementation(() => {
      return {
        exec: jest.fn().mockResolvedValue(reservations),
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        query: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
      };
    });

    const MockReservationSchema = jest.fn().mockImplementation(() => {
      return {
        date: { required: true, type: String },
        facility: { required: true, type: String },
        instance: jest.fn().mockReturnThis(),
        path: jest.fn().mockReturnThis(),
        time: { required: true, type: String },
      };
    });

    jest
      .spyOn(reservationSchema, "path")
      .mockImplementation(MockReservationSchema);

    (Reservation.find as jest.Mock).mockImplementation(MockReservationModel);
    (Table.find as jest.Mock).mockResolvedValue(tables);
    const res = await findAvailableTables(adjust, searchOptions);
    expect(res).toEqual(tables);
  });
});

// const mongoose = require('mongoose');
// const { Model } = mongoose;

// // Create a mock for the Mongoose model
// const MockModel = jest.fn().mockImplementation(() => {
//   return {
//     find: jest.fn().mockReturnThis(),
//     populate: jest.fn().mockReturnThis(),
//     exec: jest.fn().mockResolvedValue([{ name: 'John Doe', age: 30 }]),
//   };
// });

// // Replace the actual model with the mock
// Model.mockImplementation(MockModel);

// // Example usage
// async function getPopulatedData() {
//   const data = await MockModel.find().populate('author').exec();
//   return data;
// }

// // Test the function
// test('should return populated data', async () => {
//   const result = await getPopulatedData();
//   expect(result).toEqual([{ name: 'John Doe', age: 30 }]);
// });
