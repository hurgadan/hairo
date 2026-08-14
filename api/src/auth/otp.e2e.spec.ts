import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { DataSource, Repository } from "typeorm";

import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { BillingModule } from "../billing/billing.module";
import { MailService } from "../mail/services/mail.service";
import { MailModule } from "../mail/mail.module";
import { PhotoAnalysis } from "../face-analysis/dao/photo-analysis.entity";
import { Photo } from "../photos/dao/photo.entity";
import { PhotoKind, PhotoStatus } from "../_contracts/photos/enums";
import { User } from "../users/dao/user.entity";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "./auth.module";
import { OTP_MAX_ATTEMPTS } from "./constants";
import { EmailOtpCode } from "./dao/email-otp-code.entity";

describe("Auth OTP (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let moduleFixture: TestingModule;
  let dataSource: DataSource;
  let codes: Repository<EmailOtpCode>;
  let photos: Repository<Photo>;
  let users: Repository<User>;

  /** Письма не уходят — код забираем из перехваченного вызова. */
  const mailMock = {
    sendVerificationCode: jest.fn().mockResolvedValue(undefined),
  };

  function lastSentCode(): string {
    const calls = mailMock.sendVerificationCode.mock.calls;
    return calls[calls.length - 1][0].code as string;
  }

  async function requestCode(email: string): Promise<string> {
    await request(httpServer)
      .post("/auth/otp/request")
      .send({ email })
      .expect(200);
    return lastSentCode();
  }

  async function createGuestWithPhoto(): Promise<{
    token: string;
    userId: string;
    photoId: string;
  }> {
    const guest = await request(httpServer).post("/auth/guest").expect(201);
    const userId = guest.body.user.id as string;

    const photo = await photos.save(
      photos.create({
        userId,
        storageKey: `photos/${userId}/selfie.png`,
        contentType: "image/png",
        sizeBytes: 128,
        kind: PhotoKind.Selfie,
        status: PhotoStatus.Uploaded,
        consentAt: new Date(),
      }),
    );

    return {
      token: guest.body.accessToken as string,
      userId,
      photoId: photo.id,
    };
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports(),
        UsersModule,
        AuthModule,
        BillingModule,
        MailModule,
      ],
    })
      .overrideProvider(MailService)
      .useValue(mailMock)
      .compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(moduleFixture));

    // Photo/PhotoAnalysis берём через DataSource: их модули этому тесту не
    // нужны, а сущности всё равно зарегистрированы глобально.
    dataSource = moduleFixture.get(DataSource);
    codes = dataSource.getRepository(EmailOtpCode);
    photos = dataSource.getRepository(Photo);
    users = dataSource.getRepository(User);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
    jest.clearAllMocks();
  });

  it("sends a code and reports how long it lives", async () => {
    const res = await request(httpServer)
      .post("/auth/otp/request")
      .send({ email: "Newbie@Example.COM" })
      .expect(200);

    expect(res.body.expiresInMinutes).toBeGreaterThan(0);
    expect(res.body.resendAfterSeconds).toBeGreaterThan(0);
    expect(mailMock.sendVerificationCode).toHaveBeenCalledTimes(1);

    // адрес нормализован — иначе Newbie@ и newbie@ станут разными аккаунтами
    const [sent] = mailMock.sendVerificationCode.mock.calls[0];
    expect(sent.to).toBe("newbie@example.com");
    expect(sent.code).toMatch(/^\d{6}$/);
  });

  it("stores only a hash of the code", async () => {
    const code = await requestCode("hash@example.com");

    const [stored] = await codes.find({ where: { email: "hash@example.com" } });
    expect(stored.codeHash).not.toBe(code);
    expect(stored.codeHash).toMatch(/^\$2[aby]\$/);
  });

  it("creates an account with the trial credit on a valid code", async () => {
    const code = await requestCode("fresh@example.com");

    const res = await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "fresh@example.com", code })
      .expect(200);

    const token = res.body.accessToken as string;
    expect(res.body.user.email).toBe("fresh@example.com");

    const balance = await request(httpServer)
      .get("/billing/balance")
      .set("authorization", `Bearer ${token}`)
      .expect(200);
    expect(balance.body.balance).toBe(1);
  });

  it("rejects a wrong code and burns the attempt", async () => {
    await requestCode("wrong@example.com");

    await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "wrong@example.com", code: "000000" })
      .expect(401);

    const [stored] = await codes.find({
      where: { email: "wrong@example.com" },
    });
    expect(stored.attempts).toBe(1);
    expect(stored.consumedAt).toBeNull();
  });

  it("refuses the code once the attempt limit is spent", async () => {
    const code = await requestCode("bruteforce@example.com");

    for (let i = 0; i < OTP_MAX_ATTEMPTS; i++) {
      await request(httpServer)
        .post("/auth/otp/verify")
        .send({ email: "bruteforce@example.com", code: "000000" })
        .expect(401);
    }

    // даже правильный код больше не принимается
    await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "bruteforce@example.com", code })
      .expect(401);
  });

  it("does not accept the same code twice", async () => {
    const code = await requestCode("once@example.com");

    await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "once@example.com", code })
      .expect(200);

    await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "once@example.com", code })
      .expect(401);
  });

  it("rejects an expired code", async () => {
    const code = await requestCode("expired@example.com");
    await codes.update(
      { email: "expired@example.com" },
      { expiresAt: new Date(Date.now() - 1000) },
    );

    await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "expired@example.com", code })
      .expect(401);
  });

  it("throttles a repeated request for the same address (429)", async () => {
    await requestCode("throttle@example.com");

    const res = await request(httpServer)
      .post("/auth/otp/request")
      .send({ email: "throttle@example.com" })
      .expect(429);

    expect(res.body.retryAfterSeconds).toBeGreaterThan(0);
    expect(mailMock.sendVerificationCode).toHaveBeenCalledTimes(1);
  });

  it("keeps the guest account and its photos when the email is free", async () => {
    const guest = await createGuestWithPhoto();
    const code = await requestCode("guest@example.com");

    const res = await request(httpServer)
      .post("/auth/otp/verify")
      .set("authorization", `Bearer ${guest.token}`)
      .send({ email: "guest@example.com", code })
      .expect(200);

    // та же учётка, а не новая — иначе история гостя осиротеет
    expect(res.body.user.id).toBe(guest.userId);
    expect(res.body.user.email).toBe("guest@example.com");

    const photo = await photos.findOne({ where: { id: guest.photoId } });
    expect(photo?.userId).toBe(guest.userId);

    const balance = await request(httpServer)
      .get("/billing/balance")
      .set("authorization", `Bearer ${res.body.accessToken as string}`)
      .expect(200);
    expect(balance.body.balance).toBe(1);
  });

  it("moves guest data into the existing account when the email is taken", async () => {
    const firstCode = await requestCode("owner@example.com");
    const owner = await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "owner@example.com", code: firstCode })
      .expect(200);
    const ownerId = owner.body.user.id as string;

    const guest = await createGuestWithPhoto();

    // ждём окно ресенда: код тому же адресу выдаётся не чаще раза в минуту
    await codes.update(
      { email: "owner@example.com" },
      { createdAt: new Date(Date.now() - 10 * 60_000) },
    );
    const secondCode = await requestCode("owner@example.com");

    const res = await request(httpServer)
      .post("/auth/otp/verify")
      .set("authorization", `Bearer ${guest.token}`)
      .send({ email: "owner@example.com", code: secondCode })
      .expect(200);

    expect(res.body.user.id).toBe(ownerId);

    const photo = await photos.findOne({ where: { id: guest.photoId } });
    expect(photo?.userId).toBe(ownerId);

    const goneGuest = await users.findOne({ where: { id: guest.userId } });
    expect(goneGuest).toBeNull();

    // бонус за существующий аккаунт повторно не начисляется
    const balance = await request(httpServer)
      .get("/billing/balance")
      .set("authorization", `Bearer ${res.body.accessToken as string}`)
      .expect(200);
    expect(balance.body.balance).toBe(1);
  });

  it("ignores an invalid bearer token instead of failing the request", async () => {
    const code = await requestCode("badtoken@example.com");

    const res = await request(httpServer)
      .post("/auth/otp/verify")
      .set("authorization", "Bearer not-a-jwt")
      .send({ email: "badtoken@example.com", code })
      .expect(200);

    expect(res.body.user.email).toBe("badtoken@example.com");
  });

  it("validates the payload", async () => {
    await request(httpServer)
      .post("/auth/otp/request")
      .send({ email: "not-an-email" })
      .expect(400);

    await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "user@example.com", code: "12" })
      .expect(400);
  });

  it("does not leak whether the address is registered", async () => {
    const known = await requestCode("known@example.com");
    await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "known@example.com", code: known })
      .expect(200);

    await codes.update(
      { email: "known@example.com" },
      { createdAt: new Date(Date.now() - 10 * 60_000) },
    );

    const forKnown = await request(httpServer)
      .post("/auth/otp/request")
      .send({ email: "known@example.com" })
      .expect(200);
    const forUnknown = await request(httpServer)
      .post("/auth/otp/request")
      .send({ email: "stranger@example.com" })
      .expect(200);

    expect(forKnown.body).toEqual(forUnknown.body);
  });

  it("leaves the analysis of a merged guest pointing at the new owner", async () => {
    const analyses = dataSource.getRepository(PhotoAnalysis);

    const firstCode = await requestCode("merge@example.com");
    const owner = await request(httpServer)
      .post("/auth/otp/verify")
      .send({ email: "merge@example.com", code: firstCode })
      .expect(200);
    const ownerId = owner.body.user.id as string;

    const guest = await createGuestWithPhoto();
    const analysis = await analyses.save(
      analyses.create({ userId: guest.userId, photoId: guest.photoId }),
    );

    await codes.update(
      { email: "merge@example.com" },
      { createdAt: new Date(Date.now() - 10 * 60_000) },
    );
    const secondCode = await requestCode("merge@example.com");

    await request(httpServer)
      .post("/auth/otp/verify")
      .set("authorization", `Bearer ${guest.token}`)
      .send({ email: "merge@example.com", code: secondCode })
      .expect(200);

    const moved = await analyses.findOne({ where: { id: analysis.id } });
    expect(moved?.userId).toBe(ownerId);
  });
});
