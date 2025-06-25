import request from "supertest";

import app from "../src/app";

describe("Test app.ts", () => {
  test("test only route", async () => {
    const res = await request(app).get("/test");
    expect(res.body).toEqual({
      data: "Ciao, TypeScript + Node.js + Express!",
    });
  });
});
