import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../_common/types";
import { ImageModelService } from "./image-model.service";
import { createModel } from "./models/create-model";

jest.mock("./models/create-model");

describe("ImageModelService", () => {
  const generateImage = jest.fn();
  const MockedCreateModel = jest.mocked(createModel);

  beforeEach(() => {
    generateImage.mockReset();
    MockedCreateModel.mockReset();
    MockedCreateModel.mockReturnValue({
      generateImage,
    } as unknown as ReturnType<typeof createModel>);
  });

  const buildService = (): ImageModelService =>
    new ImageModelService({} as ConfigService<AppConfig, true>);

  it("delegates to the underlying model when all images are supported", async () => {
    generateImage.mockResolvedValue(Buffer.from("result"));
    const service = buildService();

    const param = {
      images: [{ data: Buffer.from("a"), mimeType: "image/png" }],
      prompt: "prompt",
    };
    const result = await service.generateImage(param);

    expect(generateImage).toHaveBeenCalledWith(param);
    expect(result).toEqual(Buffer.from("result"));
  });

  it("throws before calling the model when an image mime type is unsupported", async () => {
    const service = buildService();

    await expect(
      service.generateImage({
        images: [{ data: Buffer.from("a"), mimeType: "image/gif" }],
        prompt: "prompt",
      }),
    ).rejects.toThrow("Unsupported image mime type: image/gif");
    expect(generateImage).not.toHaveBeenCalled();
  });
});
