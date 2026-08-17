import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { Locale } from "../_contracts/users/enums/locale.enum";
import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "./users.module";

describe("Users (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let moduleFixture: TestingModule;

  async function createGuest(): Promise<string> {
    const res = await request(httpServer).post("/auth/guest").expect(201);
    return res.body.accessToken as string;
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [...getTestingModuleImports(), UsersModule, AuthModule],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(moduleFixture));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
  });

  it("changes the locale of the current user", async () => {
    const token = await createGuest();

    const res = await request(httpServer)
      .patch("/users/me")
      .set("authorization", `Bearer ${token}`)
      .send({ locale: Locale.De })
      .expect(200);

    expect(res.body.locale).toBe(Locale.De);

    const me = await request(httpServer)
      .get("/auth/me")
      .set("authorization", `Bearer ${token}`)
      .expect(200);

    expect(me.body.locale).toBe(Locale.De);
  });

  it("keeps the current locale when the patch is empty", async () => {
    const token = await createGuest();

    const res = await request(httpServer)
      .patch("/users/me")
      .set("authorization", `Bearer ${token}`)
      .send({})
      .expect(200);

    expect(res.body.locale).toBe(Locale.Ru);
  });

  it("rejects a locale outside the supported set", async () => {
    const token = await createGuest();

    await request(httpServer)
      .patch("/users/me")
      .set("authorization", `Bearer ${token}`)
      .send({ locale: "fr" })
      .expect(400);
  });

  it("requires a token", async () => {
    await request(httpServer)
      .patch("/users/me")
      .send({ locale: Locale.Es })
      .expect(401);
  });
});
