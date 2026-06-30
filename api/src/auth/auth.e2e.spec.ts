import * as crypto from "node:crypto";
import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "./auth.module";

function buildInitData(botToken: string): string {
  const params = new URLSearchParams();
  params.set(
    "user",
    JSON.stringify({ id: 555001, username: "tester", first_name: "Vi" }),
  );
  params.set("auth_date", Math.floor(Date.now() / 1000).toString());

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  params.set(
    "hash",
    crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex"),
  );

  return params.toString();
}

describe("Auth (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let moduleFixture: TestingModule;
  let botToken: string;

  const creds = { email: "vi@example.com", password: "supersecret" };

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [...getTestingModuleImports(), UsersModule, AuthModule],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(moduleFixture));
    botToken =
      moduleFixture.get(ConfigService).get<string>("telegramBotToken") ?? "";
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
  });

  it("register returns a token and the user", async () => {
    const res = await request(httpServer)
      .post("/auth/register")
      .send(creds)
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.email).toBe(creds.email);
  });

  it("duplicate register returns 409", async () => {
    await request(httpServer).post("/auth/register").send(creds).expect(201);
    await request(httpServer).post("/auth/register").send(creds).expect(409);
  });

  it("login with wrong password returns 401", async () => {
    await request(httpServer).post("/auth/register").send(creds).expect(201);
    await request(httpServer)
      .post("/auth/login")
      .send({ ...creds, password: "wrongpass" })
      .expect(401);
  });

  it("me returns profile with token and 401 without", async () => {
    const reg = await request(httpServer)
      .post("/auth/register")
      .send(creds)
      .expect(201);

    await request(httpServer)
      .get("/auth/me")
      .set("authorization", `Bearer ${reg.body.accessToken}`)
      .expect(200)
      .expect((r) => expect(r.body.email).toBe(creds.email));

    await request(httpServer).get("/auth/me").expect(401);
  });

  it("telegram initData: valid signature passes, tampered is rejected", async () => {
    const initData = buildInitData(botToken);

    const res = await request(httpServer)
      .post("/auth/telegram")
      .send({ initData })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.telegramUsername).toBe("tester");

    await request(httpServer)
      .post("/auth/telegram")
      .send({ initData: `${initData}tampered` })
      .expect(401);
  });
});
