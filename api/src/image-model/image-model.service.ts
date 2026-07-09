import { Injectable } from "@nestjs/common";

import { BaseModel, IGenerateImage } from "./models/base-model";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../_common/types";
import { createModel } from "./models/create-model";
import { isSupportedImageMimeType } from "./helpers/is-supported-image-mime-type";

@Injectable()
export class ImageModelService {
  private imageModel: BaseModel;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.imageModel = createModel(this.config);
  }

  public async generateImage(param: IGenerateImage): Promise<Buffer> {
    const unsupported = param.images
      .map((image) => image.mimeType)
      .find((mimeType) => !isSupportedImageMimeType(mimeType));

    if (unsupported) {
      throw new Error(`Unsupported image mime type: ${unsupported}`);
    }

    return this.imageModel.generateImage(param);
  }
}
