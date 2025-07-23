import request from "supertest";

import app from "../src/app";

describe("app", () => {
  it("should be defined", () => {
    expect(app).toBeDefined();
  });

  it("should return 200 if route exists", async () => {
    const res = await request(app).get("/test");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: "Hello from test route!",
    });
  });
  it("should return 404 if route not found", async () => {
    const res = await request(app).get("/wrong-test");
    expect(res.status).toBe(404);
  });
});
