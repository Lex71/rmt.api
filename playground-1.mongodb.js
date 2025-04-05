// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("reserve-my-table");

// Create a new document in the collection.
// const r1 = db.getCollection('reservations').insertOne({
//   date: '2025-04-02',
//   facility: '67ead7c4c8c556d2c551e945',
//   name: 'Pippo siamo in 10 ma tavolo da 12 meglio',
//   phone: '3338561890',
//   seats: 10,
//   tables: ["67ead7c4c8c556d2c551e945"],
//   time: '20:00',
//   status: 'confirmed'
// });
// const r2 = db.getCollection("reservations").insertOne({
//   date: "2025-04-02",
//   facility: "67ead7c4c8c556d2c551e945",
//   name: "Minnie",
//   phone: "3451256489",
//   seats: 10,
//   tables: ["67ebdc1be6aaa7f1413c949d"],
//   time: "22:00",
//   status: "confirmed",
// });
// r1.tables.push("67ead7c4c8c556d2c551e946");

const moment = require("moment");
const Types = require("mongoose").Types;

const DELAY = 89;
const booking_date = "2025-04-02";
const booking_time = "20:00";
const reservations = db
  .getCollection("reservations")
  .find({
    date: booking_date,
    facility: new Types.ObjectId("67ead7c4c8c556d2c551e945"),
  })
  .toArray();

console.log("Reservations", reservations);

// Find all documents in the collection.
const allTables = db.getCollection("tables").find({}).toArray();

console.log(
  "All Tables",
  allTables.map((t) => t._id.toString()),
);

const busyTables = [];

reservations.forEach((reservation) => {
  console.log(
    `reservation ${reservation._id}: tables: ${reservation.tables.map((t) => t)}`,
  );
  const res = reservation.tables.filter((table) => {
    /* console.log(
      `booking_time: ${moment(booking_time, "HH:mm").format("HH:mm")}`,
    );
    console.log(
      `reservation.time: ${moment(reservation.time, "HH:mm").format("HH:mm")}`,
    );
    console.log(
      `reservation.time + DELAY: ${moment(reservation.time, "HH:mm").add(DELAY, "minutes").format("HH:mm")}`,
    );
    console.log(
      `isBetween: ${moment(booking_time, "HH:mm").isBetween(
        moment(reservation.time, "HH:mm"),
        moment(reservation.time, "HH:mm").add(DELAY, "minutes"),
      )}`,
    );
    console.log(
      `isBetween2: ${
        moment(booking_time, "HH:mm").isSameOrAfter(
          moment(reservation.time, "HH:mm"),
        ) &&
        moment(booking_time, "HH:mm").isSameOrBefore(
          moment(reservation.time, "HH:mm").add(DELAY, "minutes"),
        )
      }`,
    ); */
    return (
      !["paid", "noshow", "cancelled"].includes(reservation.status) &&
      ["confirmed", "rescheduled", "checkedin"].includes(reservation.status) &&
      // (reservation.time >= moment(booking_time, "HH:mm").add(DELAY, "minutes").format("HH:mm"))
      // booking_time 20:00
      // reservation time
      // 20:00  ->  21:30
      // 22:00  ->  23:30
      // moment(reservation.time, "HH:mm").isSameOrAfter(
      //   moment(booking_time, "HH:mm").add(DELAY, "minutes").format("HH:mm"),
      // )
      moment(booking_time, "HH:mm").isSameOrAfter(
        moment(reservation.time, "HH:mm"),
      ) &&
      moment(booking_time, "HH:mm").isSameOrBefore(
        moment(reservation.time, "HH:mm").add(DELAY, "minutes"),
      )
    );
  });
  busyTables.push(...res);
});

console.log(`busyTables: ${busyTables.map((t) => t)}`);

console.log(
  busyTables.includes("67ead7c4c8c556d2c551e946") ? "INCLUDED" : "NOT INCLUDED",
);

const availableTables = allTables.filter(
  (table) => !busyTables.includes(table._id.toString()),
);

console.log(`availableTables: ${availableTables.map((t) => t._id.toString())}`);
/* // then, foreach reservation, exclude tables:
// tables having a status PAID or NOSHOW or CANCELLED
// tables having a status CONFIRMED or RESCHEDULED or CHECKEDIN and a time past the booking time + DELAY
const availableTables = allTables.filter(
  (table) => {
    return (
      !allReservedTables.includes(table) ||
      ["paid", "noshow", "cancelled"].includes(
        allReservedTables.find((r) => r._id === table._id).status,
      ) || (
        ["confirmed", "rescheduled", "checkedin"].includes(
          allReservedTables.find((r) => r._id === table._id).status,
        ) && ()
      )
    );
  }
)
 */

// const availableTables = allTables.filter(
//   (table) =>
//     !allReservedTables.find(
//       (reservation) =>
//         reservation.status === "paid" ||
//         reservation.status === "noshow" ||
//         reservation.status === "cancelled"
//     ) &&
//     !allReservedTables.find(
//       (reservation) =>
//         reservation.status === "confirmed" ||
//         reservation.status === "rescheduled" ||
//         reservation.status === "checkedin"
//     )
// )
