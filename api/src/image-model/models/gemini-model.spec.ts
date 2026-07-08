import { GoogleGenAI } from "@google/genai";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { ImageModel } from "../enums";
import { GeminiModel } from "./gemini-model";

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
}));

describe("GeminiModel", () => {
  const generateContent = jest.fn();
  const MockedGoogleGenAI = jest.mocked(GoogleGenAI);

  beforeEach(() => {
    MockedGoogleGenAI.mockReset();
    generateContent.mockReset();
    MockedGoogleGenAI.mockImplementation(
      () =>
        ({
          models: { generateContent },
        }) as unknown as GoogleGenAI,
    );
  });

  const buildConfig = (): ConfigService<AppConfig, true> =>
    ({
      getOrThrow: jest.fn((key: string) => {
        if (key === "googleAiApiKey") return "test-api-key";
        if (key === "imageModel") return ImageModel.NanoBanana;
        throw new Error(`unexpected key: ${key}`);
      }),
    }) as unknown as ConfigService<AppConfig, true>;

  describe("itIsMe", () => {
    it("recognizes known Gemini image models", () => {
      expect(GeminiModel.itIsMe(ImageModel.NanoBanana)).toBe(true);
    });

    it("rejects unknown models", () => {
      expect(GeminiModel.itIsMe("gpt-image-1")).toBe(false);
    });
  });

  it("initializes the SDK client with the configured api key", () => {
    new GeminiModel(buildConfig());

    expect(MockedGoogleGenAI).toHaveBeenCalledWith({ apiKey: "test-api-key" });
  });

  it("sends prompt and images as base64 inline data, returns the generated image", async () => {
    generateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { text: "some text part" },
              {
                inlineData: {
                  data: Buffer.from("image-bytes").toString("base64"),
                },
              },
            ],
          },
        },
      ],
    });

    const model = new GeminiModel(buildConfig());
    const result = await model.generateImage({
      images: [{ data: Buffer.from("input"), mimeType: "image/png" }],
      prompt: "add bangs",
    });

    expect(generateContent).toHaveBeenCalledWith({
      model: ImageModel.NanoBanana,
      contents: [
        {
          role: "user",
          parts: [
            { text: "add bangs" },
            {
              inlineData: {
                mimeType: "image/png",
                data: Buffer.from("input").toString("base64"),
              },
            },
          ],
        },
      ],
      config: { imageConfig: { imageSize: "2K", aspectRatio: undefined } },
    });
    expect(result).toEqual(Buffer.from("image-bytes"));
  });

  it("passes an explicit imageSize and aspectRatio through", async () => {
    generateContent.mockResolvedValue({
      candidates: [
        {
          content: {
            parts: [
              { inlineData: { data: Buffer.from("x").toString("base64") } },
            ],
          },
        },
      ],
    });

    const model = new GeminiModel(buildConfig());
    await model.generateImage({
      images: [],
      prompt: "p",
      imageSize: "4K",
      aspectRatio: "16:9",
    });

    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        config: { imageConfig: { imageSize: "4K", aspectRatio: "16:9" } },
      }),
    );
  });

  it("throws when the model does not return an image", async () => {
    generateContent.mockResolvedValue({
      candidates: [{ content: { parts: [{ text: "no image here" }] } }],
    });

    const model = new GeminiModel(buildConfig());

    await expect(
      model.generateImage({ images: [], prompt: "p" }),
    ).rejects.toThrow("Model did not return an image");
  });
});
