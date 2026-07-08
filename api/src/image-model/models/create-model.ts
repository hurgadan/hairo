import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../_common/types";
import { BaseModel, BaseModelCtor } from "./base-model";
import { GeminiModel } from "./gemini-model";

const models: BaseModelCtor[] = [GeminiModel];

export function createModel(config: ConfigService<AppConfig, true>): BaseModel {
  const model = config.getOrThrow("imageModel", { infer: true });

  const Ctor = models.find((m) => m.itIsMe(model));

  if (!Ctor) {
    throw new Error(`Unknown model: ${model}`);
  }

  return new Ctor(config);
}
