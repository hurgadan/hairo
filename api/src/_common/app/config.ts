import * as dotenv from "dotenv";

dotenv.config({ quiet: true });

import * as process from "node:process";
import { DataSourceOptions } from "typeorm";
import { AppConfig, StorageConfig } from "../types";

const databaseConnectionOptions: DataSourceOptions = {
  type: "postgres",
  host: getEnvString("DB_HOST"),
  port: getEnvNumber("DB_PORT"),
  username: getEnvString("DB_LOGIN"),
  password: getEnvString("DB_PASSWORD"),
  database: getEnvString("DB_NAME"),
  logging: getEnvBoolean("DB_ENABLE_LOGGING"),
  synchronize: false,
};

const storage: StorageConfig = {
  endpoint: getEnvString("STORAGE_ENDPOINT", false) || undefined,
  region: getEnvString("STORAGE_REGION", false) || "eu-central-1",
  accessKeyId: getEnvString("STORAGE_ACCESS_KEY_ID"),
  secretAccessKey: getEnvString("STORAGE_SECRET_ACCESS_KEY"),
  bucket: getEnvString("STORAGE_BUCKET"),
  forcePathStyle: getEnvBoolean("STORAGE_FORCE_PATH_STYLE", false) ?? false,
  publicUrl: getEnvString("STORAGE_PUBLIC_URL", false) || undefined,
};

export default (): AppConfig => ({
  appName: getEnvString("APP_NAME"),
  port: getEnvNumber("PORT", false) ?? 3001,
  nodeEnv: getEnvString("NODE_ENV", false) || "development",
  logLevel: getEnvString("LOG_LEVEL", false) || "info",
  recipient: getEnvString("RECIPIENT"),
  telegramBotToken: getEnvString("TELEGRAM_BOT_TOKEN"),
  jwtSecret: getEnvString("JWT_SECRET", false) || "dev-secret-change-me",
  jwtExpiresIn: getEnvString("JWT_EXPIRES_IN", false) || "7d",
  databaseConnectionOptions,
  storage,
});

function getEnvString(envName: string, strict?: true): string;
function getEnvString(envName: string, strict: false): string | undefined;
function getEnvString(envName: string, strict = true): string | undefined {
  const raw = process.env[envName];
  if (raw === undefined) {
    if (strict) {
      throw new Error(`Environment ${envName} is undefined.`);
    }
    return undefined;
  }

  return raw.trim();
}

function getEnvNumber(envName: string, strict?: true): number;
function getEnvNumber(envName: string, strict: false): number | undefined;
function getEnvNumber(envName: string, strict = true): number | undefined {
  const raw = strict ? getEnvString(envName) : getEnvString(envName, false);
  if (raw === undefined) {
    return undefined;
  }

  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Environment ${envName} is not a number: "${raw}".`);
  }

  return value;
}

function getEnvBoolean(envName: string, strict?: true): boolean;
function getEnvBoolean(envName: string, strict: false): boolean | undefined;
function getEnvBoolean(envName: string, strict = true): boolean | undefined {
  const raw = strict ? getEnvString(envName) : getEnvString(envName, false);
  if (raw === undefined) {
    return undefined;
  }

  return raw === "true";
}
