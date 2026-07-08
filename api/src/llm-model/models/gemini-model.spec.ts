import { GoogleGenAI, Type } from "@google/genai";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { LlmModel } from "../enums";
import { GeminiModel } from "./gemini-model";

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn(),
  Type: { STRING: "STRING", OBJECT: "OBJECT" },
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
        if (key === "llmModel") return LlmModel.GeminiFlash;
        throw new Error(`unexpected key: ${key}`);
      }),
    }) as unknown as ConfigService<AppConfig, true>;

  const schema = {
    type: Type.OBJECT,
    properties: { faceShape: { type: Type.STRING } },
  };

  describe("itIsMe", () => {
    it("recognizes known Gemini text models", () => {
      expect(GeminiModel.itIsMe(LlmModel.GeminiFlash)).toBe(true);
    });

    it("rejects unknown models", () => {
      expect(GeminiModel.itIsMe("gpt-4o")).toBe(false);
    });
  });

  it("initializes the SDK client with the configured api key", () => {
    new GeminiModel(buildConfig());

    expect(MockedGoogleGenAI).toHaveBeenCalledWith({ apiKey: "test-api-key" });
  });

  it("sends prompt and images, parses the JSON response", async () => {
    generateContent.mockResolvedValue({ text: '{"faceShape":"oval"}' });

    const model = new GeminiModel(buildConfig());
    const result = await model.generateStructured({
      images: [{ data: Buffer.from("input"), mimeType: "image/png" }],
      prompt: "analyze this face",
      responseSchema: schema,
    });

    expect(generateContent).toHaveBeenCalledWith({
      model: LlmModel.GeminiFlash,
      contents: [
        {
          role: "user",
          parts: [
            { text: "analyze this face" },
            {
              inlineData: {
                mimeType: "image/png",
                data: Buffer.from("input").toString("base64"),
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    expect(result).toEqual({ faceShape: "oval" });
  });

  it("throws when the model does not return text", async () => {
    generateContent.mockResolvedValue({ text: undefined });

    const model = new GeminiModel(buildConfig());

    await expect(
      model.generateStructured({
        images: [],
        prompt: "p",
        responseSchema: schema,
      }),
    ).rejects.toThrow("Model did not return a structured response");
  });
});
