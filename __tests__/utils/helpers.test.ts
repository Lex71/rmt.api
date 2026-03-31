import {
  // comparePassword,
  // issueAccessToken,
  // issueRefreshToken,
  timeOverlaps,
} from "../../src/utils/helpers";

import config from "../../src/config/config";

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
  describe("timeOverlaps", () => {
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
});
