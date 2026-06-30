import { DataSourceOptions } from "typeorm";

export interface AppConfig {
  appName: string;
  port: number;
  nodeEnv: string;
  logLevel: string;
  recipient: string;
  telegramBotToken: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  databaseConnectionOptions: DataSourceOptions;
}
