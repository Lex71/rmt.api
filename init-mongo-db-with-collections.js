/* const assert = require("assert");

const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017"; // MongoDB connection URL
const dbName = "reserve-my-table"; // Database name

// @ts-ignore
MongoClient.connect(url, function (err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  db.createUser({
    user: "root",
    pwd: "password",
    roles: [
      {
        role: "readWrite",
        db: dbName,
      },
    ],
  });

  // Create a collection
  db.createCollection("users", function (err, res) {
    assert.equal(null, err);
    console.log("Collection created");
    client.close();
  });
}); */

// database user
db.createUser({
  user: "root",
  pwd: "password",
  roles: [
    {
      role: "readWrite",
      db: "reserve-my-table",
    },
  ],
});

// db = new Mongo().getDB("testDB");
db.createCollection("facilities", { capped: false });
db.createCollection("users", { capped: false });
/* 
db.facilities.insert([
  {
    name: "Facility 1",
    address: "Address 1",
  },
]); */
// db.createCollection("test", { capped: false });

db.users.insert([
  {
    name: "Administrator",
    email: "admin@rmt.com",
    password: "$2b$10$fyrt.SNdlPL8JdzfbhktEeq6c6fy2fG0LwzPXw7mXzY9KpwEzgUhy",
    role: "admin",
  },
]);
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
