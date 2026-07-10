import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CatalogController } from "./controllers/catalog.controller";
import { ColorOption } from "./dao/color-option.entity";
import { Hairstyle } from "./dao/hairstyle.entity";
import { CatalogRepository } from "./repositories/catalog.repository";
import { CatalogSeedService } from "./services/catalog-seed.service";
import { CatalogService } from "./services/catalog.service";

@Module({
  imports: [TypeOrmModule.forFeature([Hairstyle, ColorOption])],
  controllers: [CatalogController],
  providers: [CatalogRepository, CatalogService, CatalogSeedService],
  exports: [CatalogSeedService, CatalogService],
})
export class CatalogModule {}
