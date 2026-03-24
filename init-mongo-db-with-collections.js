/**
 *
 *
 * The db variable in a MongoDB Docker docker-entrypoint-initdb.d/ script is automatically available and refers to the database specified by the MONGO_INITDB_DATABASE environment variable during container initialization.
 *
 * Declaration: The db variable is not explicitly declared in the script. It is a built-in global variable in the MongoDB shell (used by mongosh or mongo in older versions) that represents the current database context.
 *
 * Database Context: The database context is determined by:
 *  - The MONGO_INITDB_DATABASE environment variable (if set).
 *  - If MONGO_INITDB_DATABASE is not set, the default database used is test.
 *
 * Usage: Within your .js script (e.g., init.js), you can use db to perform operations like creating collections or inserting documents:
 * // Example: Create a collection and insert a document
 *
 * db.createCollection("users");
 * db.users.insertOne({ name: "Alice", role: "admin" });
 *
 * Important Note: The script runs in the context of the database specified by MONGO_INITDB_DATABASE.
 * If you need to switch databases within the script, you can use use <databaseName>
 *
 *
 */
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
  const dbname = process.env.MONGO_INITDB_DATABASE ?? "reserve-my-table";
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@rmt.com";
  const adminPassword =
    "$2b$10$fyrt.SNdlPL8JdzfbhktEeq6c6fy2fG0LwzPXw7mXzY9KpwEzgUhy"; // hashed "admin"
  // database user
  // @ts-ignore
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
  // @ts-ignore
  db.createCollection("facilities", { capped: false });
  // @ts-ignore
  db.createCollection("users", { capped: false });
  // @ts-ignore
  db.createCollection("tables", { capped: false });
  // @ts-ignore
  db.createCollection("reservations", { capped: false });
  // create administrator
  // @ts-ignore
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
