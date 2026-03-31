import {
  comparePassword,
  hashPassword,
  issueAccessToken,
  issueRefreshToken,
  timeOverlaps,
  verifyRefreshTokenNotExpired,
} from "../../src/utils/helpers";

import config from "../../src/config/config";
import { Role } from "../../src/models/user";

describe("Helpers", () => {
  // describe("comparePassword", () => {
  //   it("should return true if the password is correct", async () => {
  //     const password = "password";
  //     const hashPassword = await hashPassword(password);
  //     const result = await comparePassword(password, hashPassword);
  //     expect(result).toBe(true);
  //   });
  // });

  // DELAY is 90 minutes, and the new booking time is 14:00, then a table whose status is CONFIRMED or CHECKEDIN that has been reserved for 12:00, will be included in the list (because the customer will probably pay at 13:30, so table is free)
  // DELAY is 90 minutes, and the new booking time is 14:00, then a table whose status is CONFIRMED or CHECKEDIN that has been reserved for 13:00, will not be included in the list (because the customer will probably pay at 13:30, so table is still busy)
  describe("Time Overlaps", () => {
    const delay = config.AVERAGE_STAYING_TIME;
    it.each([
      {
        adjust: 0,
        booking_time: "10:00",
        expected: true,
        reservation_time: "10:00",
      },
      {
        adjust: 0,
        booking_time: "08:30",
        expected: true,
        reservation_time: "10:00",
      },
      {
        adjust: 0,
        booking_time: "11:30",
        expected: true,
        reservation_time: "10:00",
      },
      {
        adjust: 105,
        booking_time: "10:00",
        expected: false,
        reservation_time: "10:00",
      },
      {
        adjust: -15,
        booking_time: "08:30",
        expected: false,
        reservation_time: "10:00",
      },
      {
        adjust: 0,
        booking_time: "11:45",
        expected: false,
        reservation_time: "10:00",
      },
      {
        adjust: 15,
        booking_time: "11:30",
        expected: false,
        reservation_time: "10:00",
      },
    ])(
      "should return $expected if reservation_time: $reservation_time, booking_time: $booking_time, adjust: $adjust",
      ({ adjust, booking_time, expected, reservation_time }) => {
        expect(
          timeOverlaps(reservation_time, booking_time, adjust, delay),
        ).toBe(expected);
      },
    );
  });

  describe("Compare Password", () => {
    it("should return true if the password is correct", async () => {
      const password = "password";
      const hash = await hashPassword(password);
      const result = await comparePassword(password, hash);
      expect(result).toBe(true);
    });
    it("should return false if the password is incorrect", async () => {
      const password = "password";
      const hash = await hashPassword(password);
      const result = await comparePassword("wrong", hash);
      expect(result).toBe(false);
    });
  });

  describe("Access Token", () => {
    const payload = {
      email: "email@mail.com",
      facility: "123",
      id: "234",
      role: Role.USER,
    };
    it("should return true if the token is not expired", () => {
      const token = issueAccessToken(payload);
      const result = verifyRefreshTokenNotExpired(token);
      expect(result).toBe(true);
    });
    it("should return false if the token is expired", async () => {
      // 1. Reset all modules to clear the cache
      jest.resetModules();

      // 2. Set your mock environment value
      process.env.ACCESS_TOKEN_EXPIRATION = "-1d";

      // 3. Mock the module that reads process.env *after* resetting
      jest.doMock("../../src/config/config", () => ({
        ...config,
        ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION, // This will now be 'mocked-from-test'
        // ... mock any other exports
      }));

      // 4. Dynamically import the module under test *after* the mock is set
      const { issueAccessToken } = await import("../../src/utils/helpers");
      const token = issueAccessToken(payload);
      const result = verifyRefreshTokenNotExpired(token);

      expect(result).toBe(false);
    });
  });

  describe("Refresh Token", () => {
    const payload = {
      id: "234",
    };
    it("should return true if the token is not expired", () => {
      const token = issueRefreshToken(payload);
      const result = verifyRefreshTokenNotExpired(token);
      expect(result).toBe(true);
    });
    it("should return false if the token is expired", async () => {
      // 1. Reset all modules to clear the cache
      jest.resetModules();

      // 2. Set your mock environment value
      process.env.REFRESH_TOKEN_EXPIRATION = "-1d";

      // 3. Mock the module that reads process.env *after* resetting
      jest.doMock("../../src/config/config", () => ({
        ...config,
        REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION, // This will now be 'mocked-from-test'
        // ... mock any other exports
      }));

      // 4. Dynamically import the module under test *after* the mock is set
      const { issueRefreshToken } = await import("../../src/utils/helpers");
      const token = issueRefreshToken(payload);
      const result = verifyRefreshTokenNotExpired(token);

      expect(result).toBe(false);
    });
  });
});
