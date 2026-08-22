import * as path from "node:path";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { AppConfig } from "../../_common/types";
import {
  compileLocalizedTemplates,
  FALLBACK_LOCALE,
  LocalizedTemplates,
} from "../../_common/utils/localized-templates";
import { Locale } from "../../_contracts/users/enums/locale.enum";
import {
  TEMPLATES_DIR,
  VERIFICATION_CODE_SUBJECT,
  VERIFICATION_CODE_TEMPLATE,
} from "../constants";
import { BaseTransport } from "../transports/base-transport";
import { createTransport } from "../transports/create-transport";

export interface ISendVerificationCode {
  to: string;
  code: string;
  /** Срок жизни кода — подставляется в текст письма (владелец срока — вызывающий модуль). */
  expiresInMinutes: number;
  /** Язык письма; без него — фолбэк-локаль. */
  locale?: Locale;
}

/**
 * Единственная точка отправки писем. Работает с абстракцией `BaseTransport`
 * и не знает, кто именно доставляет письмо — транспорт выбирает фабрика по env.
 */
@Injectable()
export class MailService {
  private readonly transport: BaseTransport;
  private readonly verificationCodeHtml: LocalizedTemplates;
  private readonly verificationCodeText: LocalizedTemplates;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    this.transport = createTransport(this.config);

    const dir = path.join(__dirname, "..", TEMPLATES_DIR);
    this.verificationCodeHtml = compileLocalizedTemplates(
      dir,
      `${VERIFICATION_CODE_TEMPLATE}.html.hbs`,
    );
    this.verificationCodeText = compileLocalizedTemplates(
      dir,
      `${VERIFICATION_CODE_TEMPLATE}.text.hbs`,
    );
  }

  public async sendVerificationCode(
    param: ISendVerificationCode,
  ): Promise<void> {
    const locale = param.locale ?? FALLBACK_LOCALE;
    const subject = VERIFICATION_CODE_SUBJECT[locale];

    const context = {
      code: param.code,
      expiresInMinutes: param.expiresInMinutes,
      subject,
    };

    await this.transport.sendMail({
      to: param.to,
      subject,
      html: this.verificationCodeHtml[locale](context),
      text: this.verificationCodeText[locale](context),
    });
  }
}
