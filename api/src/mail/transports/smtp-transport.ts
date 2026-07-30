import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import { AppConfig } from "../../_common/types";
import { SMTP_MAX_CONNECTIONS, SMTP_MAX_MESSAGES } from "../constants";
import { MailProvider } from "../enums";

import { BaseTransport, ISendMail } from "./base-transport";

/**
 * Отправка через SMTP-релей — один транспорт на все окружения: локально это
 * Mailpit/MailHog без аутентификации, в прод — SMTP-креды провайдера
 * (Mailgun/Postmark/Resend). Переключение только через env, код не меняется.
 *
 * Соединение пулится и переиспользуется: транспорт живёт столько же, сколько
 * `MailService` (один инстанс на приложение).
 */
export class SmtpTransport extends BaseTransport {
  private readonly transporter: Transporter;
  private readonly from: string;

  public static itIsMe(provider: string): boolean {
    return provider === MailProvider.Smtp;
  }

  constructor(config: ConfigService<AppConfig, true>) {
    super(config);

    const mail = config.getOrThrow("mail", { infer: true });
    this.from = mail.from;

    this.transporter = nodemailer.createTransport({
      host: mail.smtp.host,
      port: mail.smtp.port,
      secure: mail.smtp.secure,
      // Локальный Mailpit/MailHog слушает без креденшелов — auth не задаём вовсе.
      auth:
        mail.smtp.user && mail.smtp.password
          ? { user: mail.smtp.user, pass: mail.smtp.password }
          : undefined,
      pool: true,
      maxConnections: SMTP_MAX_CONNECTIONS,
      maxMessages: SMTP_MAX_MESSAGES,
    });
  }

  public async sendMail(mail: ISendMail): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
  }
}
