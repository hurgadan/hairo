import { Schema } from "@google/genai";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";

export interface IImageInput {
  data: Buffer;
  mimeType: string;
}

export interface IGenerateStructured {
  images: IImageInput[];
  prompt: string;
  /** JSON-schema-подобное описание (OpenAPI subset) — форма ожидаемого JSON-ответа. */
  responseSchema: Schema;
}

export abstract class BaseModel {
  /** config нужен только для формы конструктора (см. `BaseModelCtor`) — что с ним делать, решает конкретная модель. */
  protected constructor(_config: ConfigService<AppConfig, true>) {}

  public abstract generateStructured<T>(param: IGenerateStructured): Promise<T>;
}

export type BaseModelCtor = {
  new (config: ConfigService<AppConfig, true>): BaseModel;

  itIsMe(model: string): boolean;
};
