import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { PhotosController } from "./controllers/photos.controller";
import { Photo } from "./dao/photo.entity";
import { PhotosRepository } from "./repositories/photos.repository";
import { PhotosService } from "./services/photos.service";

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  controllers: [PhotosController],
  providers: [PhotosRepository, PhotosService],
  exports: [PhotosService],
})
export class PhotosModule {}
