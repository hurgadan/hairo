import { GoogleGenAI, Part } from "@google/genai";

import { DEFAULT_IMAGE_SIZE } from "../constants";
import { ImageModel } from "../enums";

import { BaseModel, IGenerateImage } from "./base-model";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../_common/types";

export class GeminiModel extends BaseModel {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  public static itIsMe(model: string): boolean {
    return Object.values(ImageModel).includes(model as ImageModel);
  }

  constructor(config: ConfigService<AppConfig, true>) {
    super(config);
    this.ai = new GoogleGenAI({
      apiKey: config.getOrThrow("googleAiApiKey", { infer: true }),
    });

    // itIsMe уже гарантировал, что значение валидное
    this.model = config.getOrThrow("imageModel", { infer: true });
  }

  public async generateImage(param: IGenerateImage): Promise<Buffer> {
    const {
      images,
      prompt,
      imageSize = DEFAULT_IMAGE_SIZE,
      aspectRatio,
    } = param;

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
        imageConfig: { imageSize, aspectRatio },
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData,
    );

    if (!imagePart?.inlineData?.data) {
      throw new Error("Model did not return an image");
    }

    return Buffer.from(imagePart.inlineData.data, "base64");
  }
}
