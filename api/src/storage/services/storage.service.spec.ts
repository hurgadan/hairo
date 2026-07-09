import { S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { StorageService } from "./storage.service";

jest.mock("@aws-sdk/client-s3", () => {
  const actual = jest.requireActual("@aws-sdk/client-s3");
  return { ...actual, S3Client: jest.fn() };
});

describe("StorageService", () => {
  const send = jest.fn();
  const MockedS3Client = jest.mocked(S3Client);

  beforeEach(() => {
    MockedS3Client.mockReset();
    send.mockReset();
    MockedS3Client.mockImplementation(() => ({ send }) as unknown as S3Client);
  });

  const buildService = (): StorageService =>
    new StorageService({
      get: jest.fn().mockReturnValue({
        endpoint: "http://localhost:9000",
        region: "eu-central-1",
        accessKeyId: "id",
        secretAccessKey: "secret",
        bucket: "test-bucket",
        forcePathStyle: true,
        publicUrl: undefined,
      }),
    } as unknown as ConfigService<AppConfig, true>);

  it("downloads an object and returns it as a Buffer", async () => {
    send.mockResolvedValue({
      Body: {
        transformToByteArray: jest
          .fn()
          .mockResolvedValue(Uint8Array.from([1, 2, 3])),
      },
    });

    const service = buildService();
    const result = await service.getObject("photos/user/photo.png");

    expect(result).toEqual(Buffer.from([1, 2, 3]));
  });
});
