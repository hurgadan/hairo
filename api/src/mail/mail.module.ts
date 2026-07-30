import { Global, Module } from "@nestjs/common";

import { MailService } from "./services/mail.service";

/**
 * Инфраструктурный модуль отправки писем. Global — чтобы MailService был
 * доступен доменным модулям (auth и далее) без повторного импорта, по образцу
 * StorageModule.
 */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
