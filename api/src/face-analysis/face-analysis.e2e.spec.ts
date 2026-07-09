import { Server } from "node:http";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";

import { clearTables } from "../_common/utils/tests/clear-tables";
import { createTestingAppAndHttpServer } from "../_common/utils/tests/create-testing-app-and-http-server";
import { getTestingModuleImports } from "../_common/utils/tests/get-testing-module-imports";
import { AuthModule } from "../auth/auth.module";
import { LlmModelService } from "../llm-model/llm-model.service";
import { LlmModelModule } from "../llm-model/llm-model.module";
import { PhotosModule } from "../photos/photos.module";
import { StorageService } from "../storage/services/storage.service";
import { StorageModule } from "../storage/storage.module";
import { UsersModule } from "../users/users.module";
import { FaceAnalysisModule } from "./face-analysis.module";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

interface AnalysisBody {
  status: string;
  result: { faceShape: string } | null;
  error: string | null;
}

async function pollUntilSettled(
  httpServer: Server,
  token: string,
  id: string,
  timeoutMs = 2000,
): Promise<AnalysisBody> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const res = await request(httpServer)
      .get(`/face-analysis/${id}`)
      .set("authorization", `Bearer ${token}`)
      .expect(200);

    if (res.body.status !== "pending" || Date.now() > deadline) {
      return res.body as AnalysisBody;
    }

    await new Promise((r) => setTimeout(r, 25));
  }
}

describe("FaceAnalysis (e2e)", () => {
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
      .mockResolvedValue("https://signed.example/selfie"),
  };

  const llmModelMock = {
    generateStructured: jest.fn(),
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
        LlmModelModule,
        FaceAnalysisModule,
      ],
    })
      .overrideProvider(StorageService)
      .useValue(storageMock)
      .overrideProvider(LlmModelService)
      .useValue(llmModelMock)
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

  it("starts an analysis job (202) and completes it in the background", async () => {
    llmModelMock.generateStructured.mockResolvedValue({
      faceShape: "oval",
      length: "shoulder",
      texture: ["wavy"],
      density: "medium",
      genderPresentation: "feminine",
      currentColorDescription: "dark brown",
    });

    const token = await registerUser("owner@example.com");
    const photoId = await uploadPhoto(token);

    const started = await request(httpServer)
      .post("/face-analysis")
      .set("authorization", `Bearer ${token}`)
      .send({ photoId })
      .expect(202);

    expect(started.body.status).toBe("pending");
    expect(started.body.result).toBeNull();

    const result = await pollUntilSettled(httpServer, token, started.body.id);

    expect(result.status).toBe("completed");
    expect(result.result?.faceShape).toBe("oval");
  });

  it("marks the job as failed when the LLM call throws", async () => {
    llmModelMock.generateStructured.mockRejectedValue(
      new Error("rate limited"),
    );

    const token = await registerUser("failing@example.com");
    const photoId = await uploadPhoto(token);

    const started = await request(httpServer)
      .post("/face-analysis")
      .set("authorization", `Bearer ${token}`)
      .send({ photoId })
      .expect(202);

    const result = await pollUntilSettled(httpServer, token, started.body.id);

    expect(result.status).toBe("failed");
    expect(result.error).toBe("rate limited");
  });

  it("rejects starting an analysis for a photo that isn't the caller's (404)", async () => {
    const ownerToken = await registerUser("photo-owner@example.com");
    const photoId = await uploadPhoto(ownerToken);
    const strangerToken = await registerUser("stranger@example.com");

    await request(httpServer)
      .post("/face-analysis")
      .set("authorization", `Bearer ${strangerToken}`)
      .send({ photoId })
      .expect(404);

    expect(llmModelMock.generateStructured).not.toHaveBeenCalled();
  });

  it("does not expose another user's analysis (404)", async () => {
    llmModelMock.generateStructured.mockResolvedValue({
      faceShape: "oval",
      length: "shoulder",
      texture: ["wavy"],
      density: "medium",
      genderPresentation: "feminine",
      currentColorDescription: "dark brown",
    });

    const ownerToken = await registerUser("owner2@example.com");
    const photoId = await uploadPhoto(ownerToken);
    const strangerToken = await registerUser("stranger2@example.com");

    const started = await request(httpServer)
      .post("/face-analysis")
      .set("authorization", `Bearer ${ownerToken}`)
      .send({ photoId })
      .expect(202);

    await request(httpServer)
      .get(`/face-analysis/${started.body.id}`)
      .set("authorization", `Bearer ${strangerToken}`)
      .expect(404);
  });

  it("requires authentication (401)", async () => {
    await request(httpServer)
      .post("/face-analysis")
      .send({ photoId: "00000000-0000-0000-0000-000000000000" })
      .expect(401);
  });
});
