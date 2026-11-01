import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import userRoutes from "../routes/users.route";
import { resetDb } from "../db/testSetup";

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);

describe("user rotues", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Test User", email: "test@example.com" });
  });

  it("returns 404 for a missing user", async () => {
    const res = await request(app).get("/api/users/9999");
    expect(res.status).toBe(404);
  });
});
