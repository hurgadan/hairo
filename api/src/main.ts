import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "nestjs-pino";

import { getValidationPipeParams } from "./_common/app/get-validation-pipe-params";
import { QueryFailedFilter } from "./_common/filters/query-failed.filter";
import type { AppConfig } from "./_common/types";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe(
      getValidationPipeParams(process.env.NODE_ENV !== "production"),
    ),
  );
  app.useGlobalFilters(new QueryFailedFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Hairo API")
    .setVersion("0.1.0")
    .build();
  SwaggerModule.setup(
    "docs",
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const config = app.get(ConfigService<AppConfig, true>);
  const port = config.get("port", { infer: true });

  await app.listen(port);
}

void bootstrap();
