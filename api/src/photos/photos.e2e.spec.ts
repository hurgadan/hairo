import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { AuthModule } from "../auth/auth.module";
import { StorageService } from "../storage/services/storage.service";
import { StorageModule } from "../storage/storage.module";
import { UsersModule } from "../users/users.module";
import { PhotosModule } from "./photos.module";

// Полноценный валидный 1x1 PNG — проходит magic-number проверку FileTypeValidator.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

describe("Photos (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let moduleFixture: TestingModule;

  const storageMock = {
    putObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
    getPublicUrl: jest.fn().mockReturnValue(null),
    getSignedDownloadUrl: jest
      .fn()
      .mockResolvedValue("https://signed.example/selfie"),
  };

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
        StorageModule,
        PhotosModule,
      ],
    })
      .overrideProvider(StorageService)
      .useValue(storageMock)
      .compile();

    ({ app, httpServer } = await createTestingAppAndHttpServer(moduleFixture));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await clearTables(moduleFixture);
    jest.clearAllMocks();
  });

  it("uploads a selfie with consent and returns the photo", async () => {
    const token = await registerUser("owner@example.com");

    const res = await request(httpServer)
      .post("/photos")
      .set("authorization", `Bearer ${token}`)
      .field("consent", "true")
      .attach("file", PNG, {
        filename: "selfie.png",
        contentType: "image/png",
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.kind).toBe("selfie");
    expect(res.body.status).toBe("uploaded");
    expect(res.body.contentType).toBe("image/png");
    expect(res.body.url).toBe("https://signed.example/selfie");
    expect(res.body.storageKey).toBeUndefined();
    expect(storageMock.putObject).toHaveBeenCalledTimes(1);
  });

  it("rejects upload without consent (400)", async () => {
    const token = await registerUser("noconsent@example.com");

    await request(httpServer)
      .post("/photos")
      .set("authorization", `Bearer ${token}`)
      .attach("file", PNG, {
        filename: "selfie.png",
        contentType: "image/png",
      })
      .expect(400);

    expect(storageMock.putObject).not.toHaveBeenCalled();
  });

  it("rejects a non-image file (400)", async () => {
    const token = await registerUser("badmime@example.com");

    await request(httpServer)
      .post("/photos")
      .set("authorization", `Bearer ${token}`)
      .field("consent", "true")
      .attach("file", Buffer.from("hello"), {
        filename: "note.txt",
        contentType: "text/plain",
      })
      .expect(400);

    expect(storageMock.putObject).not.toHaveBeenCalled();
  });

  it("requires authentication (401)", async () => {
    await request(httpServer)
      .post("/photos")
      .field("consent", "true")
      .attach("file", PNG, {
        filename: "selfie.png",
        contentType: "image/png",
      })
      .expect(401);
  });

  it("lists only the current user's photos", async () => {
    const token = await registerUser("lister@example.com");
    await request(httpServer)
      .post("/photos")
      .set("authorization", `Bearer ${token}`)
      .field("consent", "true")
      .attach("file", PNG, {
        filename: "selfie.png",
        contentType: "image/png",
      })
      .expect(201);

    const res = await request(httpServer)
      .get("/photos")
      .set("authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].url).toBe("https://signed.example/selfie");
  });

  it("does not expose another user's photo (404)", async () => {
    const ownerToken = await registerUser("owner2@example.com");
    const strangerToken = await registerUser("stranger@example.com");

    const uploaded = await request(httpServer)
      .post("/photos")
      .set("authorization", `Bearer ${ownerToken}`)
      .field("consent", "true")
      .attach("file", PNG, {
        filename: "selfie.png",
        contentType: "image/png",
      })
      .expect(201);

    await request(httpServer)
      .get(`/photos/${uploaded.body.id}`)
      .set("authorization", `Bearer ${strangerToken}`)
      .expect(404);
  });

  it("deletes a photo and removes it from storage", async () => {
    const token = await registerUser("deleter@example.com");
    const uploaded = await request(httpServer)
      .post("/photos")
      .set("authorization", `Bearer ${token}`)
      .field("consent", "true")
      .attach("file", PNG, {
        filename: "selfie.png",
        contentType: "image/png",
      })
      .expect(201);

    await request(httpServer)
      .delete(`/photos/${uploaded.body.id}`)
      .set("authorization", `Bearer ${token}`)
      .expect(204);

    expect(storageMock.deleteObject).toHaveBeenCalledTimes(1);

    await request(httpServer)
      .get(`/photos/${uploaded.body.id}`)
      .set("authorization", `Bearer ${token}`)
      .expect(404);
  });
});
