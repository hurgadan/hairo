import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "../app.module";
import { CatalogSeedService } from "../catalog/services/catalog-seed.service";

async function run(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log"],
  });

  try {
    await app.get(CatalogSeedService).seedHairstyles();
  } finally {
    await app.close();
  }
}

void run().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
