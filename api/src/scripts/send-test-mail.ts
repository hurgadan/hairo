import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "../app.module";
import { MailService } from "../mail/services/mail.service";

const DEFAULT_RECIPIENT = "dev@hairo.local";
const TEST_CODE = "482913";
const TEST_EXPIRES_IN_MINUTES = 10;

/**
 * Проверка почтовой конфигурации вживую: `npm run mail:test -- you@example.com`.
 * С `MAIL_PROVIDER=smtp` и поднятым `db:up` письмо видно в Mailpit
 * (http://localhost:8025); с `log` — печатается в консоль.
 */
async function run(): Promise<void> {
  const to = process.argv[2] ?? DEFAULT_RECIPIENT;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["error", "warn", "log"],
  });

  try {
    await app.get(MailService).sendVerificationCode({
      to,
      code: TEST_CODE,
      expiresInMinutes: TEST_EXPIRES_IN_MINUTES,
    });
    console.log(`Verification code mail dispatched to ${to}`);
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
