import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { GenerationStatus } from "../_contracts/generation/enums";
import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { AuthModule } from "../auth/auth.module";
import { ImageModelService } from "../image-model/image-model.service";
import { ImageModelModule } from "../image-model/image-model.module";
import { PhotosModule } from "../photos/photos.module";
import { StorageService } from "../storage/services/storage.service";
import { StorageModule } from "../storage/storage.module";
import { UsersModule } from "../users/users.module";
import { GenerationModule } from "./generation.module";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

interface GenerationBody {
  status: GenerationStatus;
  resultUrl: string | null;
  error: string | null;
}

async function pollUntilSettled(
  httpServer: Server,
  token: string,
  id: string,
  timeoutMs = 2000,
): Promise<GenerationBody> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const res = await request(httpServer)
      .get(`/generation/${id}`)
      .set("authorization", `Bearer ${token}`)
      .expect(200);

    if (res.body.status !== GenerationStatus.Pending || Date.now() > deadline) {
      return res.body as GenerationBody;
    }

    await new Promise((r) => setTimeout(r, 25));
  }
}

describe("Generation (e2e)", () => {
  let app: INestApplication;
  let httpServer: Server;
  let moduleFixture: TestingModule;

  const storageMock = {
    putObject: jest.fn().mockResolvedValue(undefined),
    deleteObject: jest.fn().mockResolvedValue(undefined),
    getObject: jest.fn().mockResolvedValue(Buffer.from("bytes")),
    getPublicUrl: jest.fn().mockReturnValue(null),
    getSignedDownloadUrl: jest
      .fn()
      .mockResolvedValue("https://signed.example/result"),
  };

  const imageModelMock = {
    generateImage: jest.fn(),
  };

  async function registerUser(email: string): Promise<string> {
    const res = await request(httpServer)
      .post("/auth/register")
      .send({ email, password: "supersecret" })
      .expect(201);
    return res.body.accessToken as string;
  }

  async function uploadPhoto(token: string): Promise<string> {
    const res = await request(httpServer)
      .post("/photos")
      .set("authorization", `Bearer ${token}`)
      .field("consent", "true")
      .attach("file", PNG, { filename: "selfie.png", contentType: "image/png" })
      .expect(201);
    return res.body.id as string;
  }

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [
        ...getTestingModuleImports(),
        UsersModule,
        AuthModule,
        StorageModule,
        PhotosModule,
        ImageModelModule,
        GenerationModule,
      ],
    })
      .overrideProvider(StorageService)
      .useValue(storageMock)
      .overrideProvider(ImageModelService)
      .useValue(imageModelMock)
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

  it("starts a generation job (202) and completes it in the background", async () => {
    imageModelMock.generateImage
      .mockResolvedValueOnce(Buffer.from("enhanced"))
      .mockResolvedValueOnce(Buffer.from("restyled"));

    const token = await registerUser("owner@example.com");
    const photoId = await uploadPhoto(token);

    const started = await request(httpServer)
      .post("/generation")
      .set("authorization", `Bearer ${token}`)
      .send({ photoId })
      .expect(202);

    expect(started.body.status).toBe(GenerationStatus.Pending);
    expect(started.body.resultUrl).toBeNull();

    const result = await pollUntilSettled(httpServer, token, started.body.id);

    expect(result.status).toBe(GenerationStatus.Completed);
    expect(result.resultUrl).toBe("https://signed.example/result");
    expect(imageModelMock.generateImage).toHaveBeenCalledTimes(2);
  });

  it("marks the job as failed when the enhance step fails, without calling restyle", async () => {
    imageModelMock.generateImage.mockRejectedValueOnce(
      new Error("rate limited"),
    );

    const token = await registerUser("failing@example.com");
    const photoId = await uploadPhoto(token);

    const started = await request(httpServer)
      .post("/generation")
      .set("authorization", `Bearer ${token}`)
      .send({ photoId })
      .expect(202);

    const result = await pollUntilSettled(httpServer, token, started.body.id);

    expect(result.status).toBe(GenerationStatus.Failed);
    expect(result.error).toBe("rate limited");
    expect(imageModelMock.generateImage).toHaveBeenCalledTimes(1);
  });

  it("rejects starting a generation for a photo that isn't the caller's (404)", async () => {
    const ownerToken = await registerUser("photo-owner@example.com");
    const photoId = await uploadPhoto(ownerToken);
    const strangerToken = await registerUser("stranger@example.com");

    await request(httpServer)
      .post("/generation")
      .set("authorization", `Bearer ${strangerToken}`)
      .send({ photoId })
      .expect(404);

    expect(imageModelMock.generateImage).not.toHaveBeenCalled();
  });

  it("does not expose another user's generation (404)", async () => {
    imageModelMock.generateImage
      .mockResolvedValueOnce(Buffer.from("enhanced"))
      .mockResolvedValueOnce(Buffer.from("restyled"));

    const ownerToken = await registerUser("owner2@example.com");
    const photoId = await uploadPhoto(ownerToken);
    const strangerToken = await registerUser("stranger2@example.com");

    const started = await request(httpServer)
      .post("/generation")
      .set("authorization", `Bearer ${ownerToken}`)
      .send({ photoId })
      .expect(202);

    await request(httpServer)
      .get(`/generation/${started.body.id}`)
      .set("authorization", `Bearer ${strangerToken}`)
      .expect(404);
  });

  it("requires authentication (401)", async () => {
    await request(httpServer)
      .post("/generation")
      .send({ photoId: "00000000-0000-0000-0000-000000000000" })
      .expect(401);
  });
});
