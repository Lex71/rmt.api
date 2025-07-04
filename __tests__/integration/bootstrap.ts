import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;
let originalError: typeof console.error;
// let originalConsole: typeof console;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  await mongoose.connect(uri);
  originalError = console.error;
  // originalConsole = console;
  console.error = jest.fn();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
  console.error = originalError;
  // console = originalConsole;
});

// afterEach(async () => {
//   const collections = mongoose.connection.collections;

//   for (const key in collections) {
//     if (["users", "refreshTokens"].includes(key)) {
//       continue;
//     }
//     const collection = collections[key];
//     await collection.deleteMany();
//   }
// });
