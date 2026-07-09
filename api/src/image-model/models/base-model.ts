import { SupportedAspectRatio, SupportedImageSize } from "../types";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../_common/types";

export interface IImageInput {
  data: Buffer;
  mimeType: string;
}

export interface IGenerateImage {
  images: IImageInput[];
  prompt: string;
  /** Дефолт SDK без явного значения — 1K. */
  imageSize?: SupportedImageSize;
  /** Не задан — модель сама решает (обычно по рамке входного фото). */
  aspectRatio?: SupportedAspectRatio;
}

export abstract class BaseModel {
  /** config нужен только для формы конструктора (см. `BaseModelCtor`) — что с ним делать, решает конкретная модель. */
  protected constructor(_config: ConfigService<AppConfig, true>) {}

  public abstract generateImage({
    images,
    prompt,
    imageSize,
    aspectRatio,
  }: IGenerateImage): Promise<Buffer>;
}

export type BaseModelCtor = {
  new (config: ConfigService<AppConfig, true>): BaseModel;

  itIsMe(model: string): boolean;
};
