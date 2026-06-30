import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import pinoLoggerModule from "./_common/app/app-modules/pino-logger";
import typeOrmModule from "./_common/app/app-modules/type-orm";
import config from "./_common/app/config";
import { AuthModule } from "./auth/auth.module";
import { CatalogModule } from "./catalog/catalog.module";
import { HealthModule } from "./health/health.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    pinoLoggerModule,
    typeOrmModule,
    HealthModule,
    CatalogModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
