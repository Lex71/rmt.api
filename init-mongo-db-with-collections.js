import dotenv from "dotenv";
// import { MongoClient } from "mongodb";

// if (process.env.NODE_ENV !== "production") {
//   dotenv.config();
//   const dbname = process.env.MONGO_INITDB_DATABASE ?? "reserve-my-table";
//   const url = process.env.MONGODB_URL ?? "mongodb://localhost:27017";
//   MongoClient.connect(url)
//     .then((client) => {
//       console.log("Connected successfully to server");
//       const db = client.db(dbname);

//       // db.createUser({
//       //   user: "root",
//       //   pwd: "password",
//       //   roles: [
//       //     {
//       //       role: "readWrite",
//       //       db: dbname,
//       //     },
//       //   ],
//       // });
//       // db.command({
//       //   createUser: "root",
//       //   pwd: "password",
//       //   roles: [
//       //     {
//       //       role: "readWrite",
//       //       db: dbname,
//       //     },
//       //   ],
//       // });
//       db.admin().command({
//         createUser: "root",
//         pwd: "password",
//         roles: [
//           {
//             role: "readWrite",
//             db: dbname,
//           },
//         ],
//       });

//       // db = new Mongo().getDB("testDB");
//       db.createCollection("facilities", { capped: false });
//       db.createCollection("users", { capped: false });
//       db.createCollection("tables", { capped: false });
//       db.createCollection("reservations", { capped: false });
//       // db.createCollection("test", { capped: false });

//       // db.users.insert([
//       //   {
//       //     name: "Administrator",
//       //     email: process.env.ADMIN_EMAIL ?? "admin@rmt.com",
//       //     password:
//       //       "$2b$10$fyrt.SNdlPL8JdzfbhktEeq6c6fy2fG0LwzPXw7mXzY9KpwEzgUhy",
//       //     role: "admin",
//       //   },
//       // ]);
//       db.collection("users").insertOne([
//         {
//           name: "Administrator",
//           email: process.env.ADMIN_EMAIL ?? "admin@rmt.com",
//           password:
//             "$2b$10$fyrt.SNdlPL8JdzfbhktEeq6c6fy2fG0LwzPXw7mXzY9KpwEzgUhy",
//           role: "admin",
//         },
//       ]);

//       // ... rest of your code
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// }
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
  const dbname = process.env.MONGO_INITDB_DATABASE ?? "reserve-my-table";
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@rmt.com";
  const adminPassword =
    "$2b$10$fyrt.SNdlPL8JdzfbhktEeq6c6fy2fG0LwzPXw7mXzY9KpwEzgUhy"; // hashed "admin"
  // database user
  db.createUser({
    user: "root",
    pwd: "password",
    roles: [
      {
        role: "readWrite",
        db: dbname,
      },
    ],
  });

  // db = new Mongo().getDB("testDB");
  db.createCollection("facilities", { capped: false });
  db.createCollection("users", { capped: false });
  db.createCollection("tables", { capped: false });
  db.createCollection("reservations", { capped: false });
  // create administrator
  db.users.insert([
    {
      name: "Administrator",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    },
  ]);
}

/* db.getCollection("facilities").insertOne({
  name: "Facility 1",
  address: "Address 1",
  tasks: [],
});

const f1 = db
  .getCollection("facilities")
  .find({
    name: "Facility 1",
  })
  .next();

db.tables.insertOne({
  name: "Table 1 of" + f1.name,
  description: "Big Table",
  seats: 12,
  facility: f1._id,
});

const t1 = db
  .getCollection("tables")
  .find({
    facility: f1._id,
  })
  .next();
console.log(JSON.stringify(t1)); */
/* (async function () {
  const saltRounds = 10;
  const password = "admin";
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  db.users.insert([
    {
      name: "Administrator",
      email: "admin@rmt.com",
      password: passwordHash,
      role: "admin",
    },
  ]);
})(); */

// db.test.insert([
//   { item: 1 },
//   { item: 2 },
//   { item: 3 },
//   { item: 4 },
//   { item: 5 },
// ]);
