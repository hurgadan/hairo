import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../_common/types";
import { isSupportedImageMimeType } from "../_common/utils/is-supported-image-mime-type";
import { BaseModel, IGenerateStructured } from "./models/base-model";
import { createModel } from "./models/create-model";

@Injectable()
export class LlmModelService {
  private model: BaseModel;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.model = createModel(this.config);
  }

  public async generateStructured<T>(param: IGenerateStructured): Promise<T> {
    const unsupported = param.images
      .map((image) => image.mimeType)
      .find((mimeType) => !isSupportedImageMimeType(mimeType));

    if (unsupported) {
      throw new Error(`Unsupported image mime type: ${unsupported}`);
    }

    return this.model.generateStructured<T>(param);
  }
}
