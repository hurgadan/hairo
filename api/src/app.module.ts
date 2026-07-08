import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import pinoLoggerModule from "./_common/app/app-modules/pino-logger";
import typeOrmModule from "./_common/app/app-modules/type-orm";
import config from "./_common/app/config";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { HealthModule } from "./health/health.module";
import { PhotosModule } from "./photos/photos.module";
import { StorageModule } from "./storage/storage.module";
import { UsersModule } from "./users/users.module";
import { ImageModelModule } from "./image-model/image-model.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    pinoLoggerModule,
    typeOrmModule,
    ImageModelModule,
    StorageModule,
    HealthModule,
    CatalogModule,
    UsersModule,
    AuthModule,
    PhotosModule,
  ],
})
export class AppModule {}
