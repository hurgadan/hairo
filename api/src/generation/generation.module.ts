import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CatalogModule } from "../catalog/catalog.module";
import { ImageModelModule } from "../image-model/image-model.module";
import { PhotosModule } from "../photos/photos.module";
import { GenerationController } from "./controllers/generation.controller";
import { Generation } from "./dao/generation.entity";
import { GenerationRepository } from "./repositories/generation.repository";
import { GenerationService } from "./services/generation.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Generation]),
    PhotosModule,
    CatalogModule,
    ImageModelModule,
  ],
  controllers: [GenerationController],
  providers: [GenerationRepository, GenerationService],
})
export class GenerationModule {}
