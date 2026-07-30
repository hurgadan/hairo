import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import { MailProvider } from "../enums";

import { BaseTransport, ISendMail } from "./base-transport";

/**
 * Ничего не отправляет — печатает письмо в лог. Дефолтный транспорт: позволяет
 * поднять приложение и прогнать e2e без SMTP-сервера, а в разработке — увидеть
 * код подтверждения прямо в консоли, не открывая почтовый клиент.
 */
export class LogTransport extends BaseTransport {
  private readonly logger = new Logger(LogTransport.name);
  private readonly from: string;

  public static itIsMe(provider: string): boolean {
    return provider === MailProvider.Log;
  }

  constructor(config: ConfigService<AppConfig, true>) {
    super(config);
    this.from = config.getOrThrow("mail", { infer: true }).from;
  }

  public sendMail(mail: ISendMail): Promise<void> {
    this.logger.log(
      `Mail not sent (log transport). from=${this.from} to=${mail.to} subject="${mail.subject}"\n${mail.text}`,
    );

    return Promise.resolve();
  }
}
