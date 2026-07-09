import { DataSourceOptions } from "typeorm";

export interface StorageConfig {
  /** S3 endpoint. Задан для MinIO/R2 (dev/prod), пуст для нативного AWS S3. */
  endpoint: string | undefined;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** true для MinIO (path-style URL), false/undefined для virtual-hosted (R2/S3). */
  forcePathStyle: boolean;
  /** Базовый публичный URL (CDN) для отдачи объектов; пуст — отдаём через presigned URL. */
  publicUrl: string | undefined;
}

export interface AppConfig {
  appName: string;
  port: number;
  nodeEnv: string;
  logLevel: string;
  recipient: string;
  telegramBotToken: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  imageModel: string;
  googleAiApiKey: string;
  databaseConnectionOptions: DataSourceOptions;
  storage: StorageConfig;
}
