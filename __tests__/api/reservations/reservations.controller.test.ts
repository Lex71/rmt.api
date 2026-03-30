import { Request, Response } from "express";
// import request from "supertest";
// import app from "../../src/app"; // Assuming app.ts initializes Express
// import { Types } from "mongoose";
import { getReservableTables } from "../../../src/api/reservations/reservations.controller";
import { findAvailableTables } from "../../../src/api/reservations/reservations.service";
// import Reservation, {
//   IReservation,
//   Status,
// } from "../../../src/models/reservation";
import { ITable /*,  { IFacility } */ } from "../../../src/models/table";
// import { find as findTables } from "../../src/services/tableService";
// import { ApplicationError } from "../../src/utils/errors";

jest.mock("../../../src/models/table");
jest.mock("../../../src/models/reservation");
jest.mock("../../../src/api/reservations/reservations.service");

// const mockRequest = () => {
//   return {
//     user: {
//       email: "test@example.com",
//     },
//   } as unknown as Request;
// };

const mockReservableTablesRequest = () => {
  return {
    query: {
      date: "2023-05-01",
      time: "12:00",
    },
    user: {
      facility: "123",
    },
  } as unknown as Request;
};

const mockResponse = () => {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(), // chained
  } as unknown as Response;
};

const mockNext = () => jest.fn();

describe("getReservableTables method", () => {
  afterEach(() => {
    // restore the spy created with spyOn
    jest.restoreAllMocks();
  });
  it("should return empty array if no tables are available", async () => {
    const req = mockReservableTablesRequest();
    const res = mockResponse();
    const next = mockNext();

    // const facilityID = "123" as unknown as Types.ObjectId;
    const tables: ITable[] = [
      // {
      //   _id: new Types.ObjectId(),
      //   facility: facilityID,
      //   name: "Table 1",
      //   seats: 4,
      // },
    ];
    // const reservations: IReservation[] = [
    //   {
    //     _id: new Types.ObjectId(),
    //     date: "2023-05-01",
    //     facility: facilityID,
    //     name: "Reservation 1",
    //     phone: "1234567890",
    //     seats: 4,
    //     status: Status.CONFIRMED,
    //     tables: tables,
    //     time: "12:00",
    //   },
    // ];
    // (Table.find as jest.Mock).mockResolvedValue(tables);
    // (Reservation.find as jest.Mock).mockResolvedValue(reservations);
    (findAvailableTables as jest.Mock).mockResolvedValue(tables);

    await getReservableTables(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });
});
