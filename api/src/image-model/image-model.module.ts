import { Module } from "@nestjs/common";
import { ImageModelService } from "./image-model.service";

@Module({
  providers: [ImageModelService],
  exports: [ImageModelService],
})
export class ImageModelModule {}
