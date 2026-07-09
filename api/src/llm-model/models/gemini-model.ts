import { GoogleGenAI, Part } from "@google/genai";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { LlmModel } from "../enums";
import { BaseModel, IGenerateStructured } from "./base-model";

export class GeminiModel extends BaseModel {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  public static itIsMe(model: string): boolean {
    return Object.values(LlmModel).includes(model as LlmModel);
  }

  constructor(config: ConfigService<AppConfig, true>) {
    super(config);
    this.ai = new GoogleGenAI({
      apiKey: config.getOrThrow("googleAiApiKey", { infer: true }),
    });

    // itIsMe уже гарантировал, что значение валидное
    this.model = config.getOrThrow("llmModel", { infer: true });
  }

  public async generateStructured<T>(param: IGenerateStructured): Promise<T> {
    const { images, prompt, responseSchema } = param;

    const parts: Part[] = [
      { text: prompt },
      ...images.map((image) => ({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data.toString("base64"),
        },
      })),
    ];

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    if (!response.text) {
      throw new Error("Model did not return a structured response");
    }

    return JSON.parse(response.text) as T;
  }
}
