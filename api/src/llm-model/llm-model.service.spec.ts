import { Type } from "@google/genai";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../_common/types";
import { LlmModelService } from "./llm-model.service";
import { createModel } from "./models/create-model";

jest.mock("./models/create-model");

describe("LlmModelService", () => {
  const generateStructured = jest.fn();
  const MockedCreateModel = jest.mocked(createModel);

  beforeEach(() => {
    generateStructured.mockReset();
    MockedCreateModel.mockReset();
    MockedCreateModel.mockReturnValue({
      generateStructured,
    } as unknown as ReturnType<typeof createModel>);
  });

  const buildService = (): LlmModelService =>
    new LlmModelService({} as ConfigService<AppConfig, true>);

  const schema = { type: Type.OBJECT };

  it("delegates to the underlying model when all images are supported", async () => {
    generateStructured.mockResolvedValue({ faceShape: "oval" });
    const service = buildService();

    const param = {
      images: [{ data: Buffer.from("a"), mimeType: "image/png" }],
      prompt: "prompt",
      responseSchema: schema,
    };
    const result = await service.generateStructured(param);

    expect(generateStructured).toHaveBeenCalledWith(param);
    expect(result).toEqual({ faceShape: "oval" });
  });

  it("throws before calling the model when an image mime type is unsupported", async () => {
    const service = buildService();

    await expect(
      service.generateStructured({
        images: [{ data: Buffer.from("a"), mimeType: "image/gif" }],
        prompt: "prompt",
        responseSchema: schema,
      }),
    ).rejects.toThrow("Unsupported image mime type: image/gif");
    expect(generateStructured).not.toHaveBeenCalled();
  });
});
