import request from "supertest";

import app from "../src/app.ts";

describe("Test app.ts", () => {
  test("test only route", async () => {
    const res = await request(app).get("/test");
    expect(res.body).toEqual({
      message: "Ciao, TypeScript + Node.js + Express!",
    });
  });
});
