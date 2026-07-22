import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { CreditTransactionType } from "../_contracts/billing/enums/transaction-type.enum";
import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { SIGNUP_BONUS_CREDITS } from "./constants";
import { BillingModule } from "./billing.module";

describe("Billing (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let moduleFixture: TestingModule;

  async function registerUser(email: string): Promise<string> {
    const res = await request(httpServer)
      .post("/auth/register")
      .send({ email, password: "supersecret" })
      .expect(201);
    return res.body.accessToken as string;
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports(),
        UsersModule,
        AuthModule,
        BillingModule,
      ],
    }).compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(moduleFixture));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
  });

  it("grants the signup bonus on registration", async () => {
    const token = await registerUser("newbie@example.com");

    const res = await request(httpServer)
      .get("/billing/balance")
      .set("authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.balance).toBe(SIGNUP_BONUS_CREDITS);
  });

  it("grants the signup bonus to a guest session", async () => {
    const guest = await request(httpServer).post("/auth/guest").expect(201);

    const res = await request(httpServer)
      .get("/billing/balance")
      .set("authorization", `Bearer ${guest.body.accessToken as string}`)
      .expect(200);

    expect(res.body.balance).toBe(SIGNUP_BONUS_CREDITS);
  });

  it("records the signup bonus in the transaction history", async () => {
    const token = await registerUser("history@example.com");

    const res = await request(httpServer)
      .get("/billing/transactions")
      .set("authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      amount: SIGNUP_BONUS_CREDITS,
      type: CreditTransactionType.SignupBonus,
    });
    expect(res.body[0].id).toBeDefined();
    expect(res.body[0].createdAt).toBeDefined();
    // служебные поля не утекают в DTO
    expect(res.body[0].reason).toBeUndefined();
    expect(res.body[0].userId).toBeUndefined();
    expect(res.body[0].stripeEventId).toBeUndefined();
  });

  it("requires authentication (401)", async () => {
    await request(httpServer).get("/billing/balance").expect(401);
    await request(httpServer).get("/billing/transactions").expect(401);
  });

  it("isolates balances between users", async () => {
    const ownerToken = await registerUser("owner@example.com");
    const strangerToken = await registerUser("stranger@example.com");

    // оба видят только свой trial-бонус — по одной транзакции каждый
    for (const token of [ownerToken, strangerToken]) {
      const res = await request(httpServer)
        .get("/billing/transactions")
        .set("authorization", `Bearer ${token}`)
        .expect(200);
      expect(res.body).toHaveLength(1);
    }
  });
});
