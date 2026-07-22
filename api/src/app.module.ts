import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";

import pinoLoggerModule from "./_common/app/app-modules/pino-logger";
import typeOrmModule from "./_common/app/app-modules/type-orm";
import config from "./_common/app/config";
import { AuthModule } from "./auth/auth.module";
import { BillingModule } from "./billing/billing.module";
import { CatalogModule } from "./catalog/catalog.module";
import { FaceAnalysisModule } from "./face-analysis/face-analysis.module";
import { GenerationModule } from "./generation/generation.module";
import { HealthModule } from "./health/health.module";
import { PhotosModule } from "./photos/photos.module";
import { RetentionModule } from "./retention/retention.module";
import { StorageModule } from "./storage/storage.module";
import { TouchActivityInterceptor } from "./users/interceptors/touch-activity.interceptor";
import { UsersModule } from "./users/users.module";
import { ImageModelModule } from "./image-model/image-model.module";
import { LlmModelModule } from "./llm-model/llm-model.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    ScheduleModule.forRoot(),
    pinoLoggerModule,
    typeOrmModule,
    ImageModelModule,
    LlmModelModule,
    StorageModule,
    HealthModule,
    CatalogModule,
    UsersModule,
    AuthModule,
    BillingModule,
    PhotosModule,
    FaceAnalysisModule,
    GenerationModule,
    RetentionModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: TouchActivityInterceptor }],
})
export class AppModule {}
