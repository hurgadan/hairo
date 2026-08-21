import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BillingModule } from "../billing/billing.module";
import { CatalogModule } from "../catalog/catalog.module";
import { ImageModelModule } from "../image-model/image-model.module";
import { PhotosModule } from "../photos/photos.module";
import { TelegramModule } from "../telegram/telegram.module";
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
    BillingModule,
    // Уведомление о готовом результате — импорт явный: `@Global` тут нет, и
    // e2e-модули собираются без `AppModule` (урок PR #32).
    TelegramModule,
  ],
  controllers: [GenerationController],
  providers: [GenerationRepository, GenerationService],
  exports: [GenerationService],
})
export class GenerationModule {}
